import Flashcard from "../models/Flashcard.js";
import Note from "../models/Note.js";
import { generateFlashcards } from "../services/ai.service.js";

// Helper function to strip HTML tags from content
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

// GET /api/notes/:noteId/flashcards
export const getByNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    const list = await Flashcard.find({ user: userId, note: noteId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    res.status(500).json({ 
      message: "Failed to fetch flashcards", 
      error: error.message 
    });
  }
};

// POST /api/notes/:noteId/flashcards/regenerate
export const regenerate = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Clear old cards for that note
    await Flashcard.deleteMany({ note: noteId, user: userId });

    // Strip HTML from content before sending to AI
    const cleanContent = stripHtml(note.content || "");
    
    if (cleanContent.length < 10) {
      // Update note to reflect no flashcards
      note.flashcardCount = 0;
      await note.save();
      return res.status(200).json([]);
    }

    const aiCards = await generateFlashcards({
      title: note.title || "Untitled",
      content: cleanContent,
      count: Number(process.env.FLASHCARDS_PER_NOTE || 8)
    });

    if (!aiCards || aiCards.length === 0) {
      note.flashcardCount = 0;
      await note.save();
      return res.status(200).json([]);
    }

    const docs = await Flashcard.insertMany(
      aiCards.map(c => ({
        user: userId,
        note: noteId,
        question: c.question?.trim().slice(0, 400) || "Q?",
        answer: c.answer?.trim().slice(0, 800) || "A",
        tag: c.tag?.trim() || undefined
      }))
    );

    // Update note with flashcard count
    note.flashcardCount = docs.length;
    note.flashcardsUpdatedAt = new Date();
    await note.save();

    res.status(201).json(docs);
  } catch (error) {
    console.error("Error regenerating flashcards:", error);
    res.status(500).json({ 
      message: "Failed to regenerate flashcards", 
      error: error.message 
    });
  }
};
