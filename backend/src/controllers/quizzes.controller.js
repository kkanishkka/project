// src/controllers/quizzes.controller.js
import Note from '../models/Note.js';
import QuizQuestion from '../models/QuizQuestion.js';
import { generateQuizzes as aiGenerateQuizzes } from '../services/ai.service.js';

const QUIZ_MIN_NOTE_CHARS = Number(process.env.QUIZ_MIN_NOTE_CHARS || 80);
const QUIZ_QUESTIONS_PER_NOTE = Number(process.env.QUIZ_QUESTIONS_PER_NOTE || 5);

// Very simple fallback generator.
// Turn sentences into True/False or short MCQs so you always get something.
function fallbackGenerateQuestions(raw, count) {
  const sentences = raw
    .replace(/\n+/g, ' ')
    .split(/[.?!]\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (!sentences.length) return [];

  const questions = [];
  let idx = 0;

  while (questions.length < count && idx < sentences.length) {
    const sentence = sentences[idx++];
    if (!sentence || sentence.length < 20) continue;

    const truncated = sentence.length > 200 ? sentence.slice(0, 197) + '...' : sentence;

    if (questions.length % 2 === 0) {
      // True/False style
      questions.push({
        type: 'true_false',
        question: `True or False: ${truncated}`,
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'This statement is taken directly from your notes.'
      });
    } else {
      // 3-option MCQ
      questions.push({
        type: 'mcq',
        question: `What is a key idea from this statement: "${truncated}"`,
        options: [
          truncated,
          'An unrelated concept not mentioned in your notes',
          'A minor detail that is not discussed here'
        ],
        answer: truncated,
        explanation: 'The correct answer is the option that most closely matches your note content.'
      });
    }
  }

  return questions;
}

// Strip HTML from note content
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// GET /api/quizzes?noteId=...
export async function getQuizzes(req, res) {
  try {
    const { noteId } = req.query;
    const filter = { user: req.user.id };

    if (noteId) filter.note = noteId;

    const questions = await QuizQuestion.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(questions);
  } catch (err) {
    console.error('getQuizzes error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}

// POST /api/quizzes/:noteId/generate
export async function generateQuizzes(req, res) {
  try {
    const { noteId } = req.params;
    console.log('Generating quizzes for note:', noteId, 'user:', req.user.id);

    const note = await Note.findOne({ _id: noteId, user: req.user.id });
    if (!note) {
      console.log('Note not found:', noteId);
      return res.status(404).json({ error: 'Note not found' });
    }

    const cleanContent = stripHtml(note.content || '');
    const plain = (note.title || '') + '\n' + cleanContent;
    const plainLength = plain.trim().length;

    console.log('Note content length:', plainLength, 'required:', QUIZ_MIN_NOTE_CHARS);

    if (plainLength < QUIZ_MIN_NOTE_CHARS) {
      return res.status(400).json({
        error: `Note too short for quiz. Need >= ${QUIZ_MIN_NOTE_CHARS} characters of text (after removing HTML). Your note has ${plainLength} characters.`
      });
    }

    // 1️⃣ Try AI-based quiz generator first
    let questions = [];
    try {
      const aiQuestions = await aiGenerateQuizzes({
        title: note.title || 'Untitled Note',
        content: plain,
        count: QUIZ_QUESTIONS_PER_NOTE
      });

      if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
        questions = aiQuestions.map(q => {
          const options = Array.isArray(q.options) ? q.options.slice(0, 4) : [];

          // Ensure there are at least 4 options for MCQs
          while (options.length < 4) options.push('None of the above');

          // Determine correct index and answer string
          const rawIndex = Number.isInteger(q.correctIndex) ? q.correctIndex : 0;
          const safeIndex = rawIndex >= 0 && rawIndex < options.length ? rawIndex : 0;
          const answer = options[safeIndex];

          return {
            type: q.type === 'true_false' ? 'true_false' : 'mcq',
            question: String(q.question || '').slice(0, 400),
            options,
            answer,
            explanation: q.explanation
              ? String(q.explanation).slice(0, 600)
              : 'Generated from your note.'
          };
        });
      }
    } catch (e) {
      console.error('AI quiz generation failed, will use local fallback:', e);
    }

    // 2️⃣ If AI gave nothing, fall back to our simple heuristic
    if (!questions.length) {
      console.log('Using fallback quiz generator');
      questions = fallbackGenerateQuestions(plain, QUIZ_QUESTIONS_PER_NOTE);
    }

    console.log('Generated questions:', questions.length);

    if (!questions || questions.length === 0) {
      console.error('No questions generated from content length:', plainLength);
      return res.status(500).json({
        error: 'Failed to generate quiz questions. Please ensure your note has sufficient content with complete sentences.'
      });
    }

    // Delete old quiz questions for this note
    const deleteResult = await QuizQuestion.deleteMany({ note: note._id, user: req.user.id });
    console.log('Deleted old quizzes:', deleteResult.deletedCount);

    // Create individual quiz question documents
    const quizQuestions = questions.map(q => ({
      user: req.user.id,
      note: note._id,
      noteTitle: note.title,
      ...q
    }));

    const createdQuestions = await QuizQuestion.insertMany(quizQuestions);
    console.log('Created quiz questions:', createdQuestions.length);

    return res.status(201).json(createdQuestions);
  } catch (err) {
    console.error('generateQuizzes error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
