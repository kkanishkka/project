import dotenv from "dotenv";
dotenv.config();

const PROVIDER = process.env.AI_PROVIDER || "huggingface";
const PER_NOTE = Number(process.env.FLASHCARDS_PER_NOTE || 8);
export const QUIZ_QUESTIONS_PER_NOTE = Number(process.env.QUIZ_QUESTIONS_PER_NOTE || 6);



// A compact prompt for flashcards using flan-t5-small
const systemPrompt = `Generate flashcards from the given note. Return a JSON array of objects with fields: question, answer, tag (optional). Keep answers short. No extra text.`;

// Build user prompt
function buildUserPrompt(title, content, count) {
  return `Title: ${title}\nContent:\n${content}\n\nGenerate ${count} flashcards in JSON format.`;
}

// --- Provider: Hugging Face API (flan-t5-small) ---
async function huggingfaceFlashcards({ title, content, count }) {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) throw new Error("HUGGINGFACE_API_KEY missing");

  const prompt = `${systemPrompt}\n${buildUserPrompt(title, content, count)}`;

  const res = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_length: 512,
        temperature: 0.3
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `Hugging Face API error ${res.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.error || errorMsg;
    } catch {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const json = await res.json();
  
  // Handle different response formats from Hugging Face
  let raw = "";
  if (Array.isArray(json) && json[0]?.generated_text) {
    raw = json[0].generated_text.trim();
  } else if (json.generated_text) {
    raw = json.generated_text.trim();
  } else if (typeof json === "string") {
    raw = json.trim();
  }

  if (!raw) {
    throw new Error("Empty response from Hugging Face API");
  }

  // Try to extract JSON array from the response
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    // If no JSON array found, try to parse the entire response as JSON
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      throw new Error("No valid JSON array found in response");
    }
    throw new Error("No JSON array found in response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      throw new Error("Parsed JSON is not an array");
    }
    // Validate that items have required fields
    return parsed.filter(item => item && (item.question || item.answer));
  } catch (parseError) {
    throw new Error(`Invalid JSON in response: ${parseError.message}`);
  }
}

// --- Provider: Local fallback (heuristic) ---
function localFallback({ title, content, count }) {
  if (!content || content.trim().length < 10) {
    return [];
  }

  // Split content into sentences or lines
  const sentences = content
    .split(/[.!?]\s+|[\r\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 200);

  if (sentences.length === 0) {
    // Fallback to splitting by spaces if no sentences found
    const words = content.split(/\s+/).filter(w => w.length > 3);
    const chunks = [];
    for (let i = 0; i < Math.min(count, Math.floor(words.length / 5)); i++) {
      const start = i * 5;
      const end = Math.min(start + 5, words.length);
      chunks.push(words.slice(start, end).join(" "));
    }
    return chunks.map((chunk, i) => ({
      question: `What does "${chunk}" mean in the context of ${title}?`,
      answer: `This concept is part of the topic "${title}". Review the note for details.`,
      tag: "auto"
    }));
  }

  const picks = sentences.slice(0, Math.min(count, sentences.length));
  return picks.map((sentence, i) => {
    // Create a question from the sentence
    const words = sentence.split(/\s+/);
    const keyWord = words.find(w => w.length > 5) || words[0] || "this concept";
    const question = sentence.length > 60 
      ? `What is the key point about "${keyWord}" in ${title}?`
      : `What does this mean: "${sentence.substring(0, 60)}${sentence.length > 60 ? '...' : ''}"?`;
    
    return {
      question,
      answer: sentence.length > 150 ? sentence.substring(0, 150) + "..." : sentence,
      tag: "auto"
    };
  });
}

export async function generateFlashcards({ title, content, count = PER_NOTE }) {
  if (!content || content.trim().length < 10) return [];
  const provider = (PROVIDER || "huggingface").toLowerCase();
  try {
    if (provider === "huggingface") return await huggingfaceFlashcards({ title, content, count });
    return localFallback({ title, content, count });
  } catch (e) {
    console.error("AI generation failed, using fallback:", e.message);
    return localFallback({ title, content, count });
  }
}


/* ================================ QUIZZES ================================ */
// Prompt tuned for flan-t5-small. It will try JSON; we still guard/clean.
const quizSystemPrompt = `Create multiple-choice questions from a student's note.
Return a JSON array; each object has:
- question (string)
- options (array of exactly 4 short strings)
- correctIndex (0..3)
- explanation (1-2 sentences)
No extra text, no markdown.`;

// Build prompt with randomness for variety
function buildQuizPrompt(title, content, count, seed = null) {
  const randomSeed = seed || Math.floor(Math.random() * 10000);
  return `Title: ${title}
Content:
${content}

Create ${count} MCQs following the schema. Random seed: ${randomSeed}. Make questions varied and unique.`;
}

// Same response parsing style you used for flashcards
function extractTextFromHF(json) {
  if (Array.isArray(json) && json[0]?.generated_text) return json[0].generated_text.trim();
  if (json?.generated_text) return json.generated_text.trim();
  if (typeof json === "string") return json.trim();
  return "";
}

// --- Provider: Hugging Face API (flan-t5-small) ---
async function huggingfaceQuizzes({ title, content, count }) {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) throw new Error("HUGGINGFACE_API_KEY missing");

  // Add randomness to temperature and seed for variety
  const randomTemp = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
  const prompt = `${quizSystemPrompt}\n${buildQuizPrompt(title, content, count)}`;

  const res = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_length: 900, temperature: randomTemp }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `Hugging Face API error ${res.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.error || errorMsg;
    } catch {
      errorMsg = errorText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const json = await res.json();
  const raw = extractTextFromHF(json);
  if (!raw) throw new Error("Empty response from Hugging Face API");

  // Try to extract the JSON array
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch (e) {
    // Fallback: produce simple T/F style questions
    return localQuizFallback({ title, content, count });
  }

  if (!Array.isArray(parsed)) return localQuizFallback({ title, content, count });

  // Clean + validate
  const cleaned = parsed
    .filter(q => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
    .slice(0, count)
    .map(q => {
      const opts = q.options.slice(0, 4);
      while (opts.length < 4) opts.push("None of the above");
      const idx = Number.isInteger(q.correctIndex) ? Math.max(0, Math.min(3, q.correctIndex)) : 0;
      return {
        question: String(q.question).slice(0, 400),
        options: opts.map(o => String(o).slice(0, 200)),
        correctIndex: idx,
        explanation: (q.explanation ? String(q.explanation) : "").slice(0, 600),
        difficulty: ["easy","medium","hard"].includes(q.difficulty) ? q.difficulty : "medium"
      };
    });

  return cleaned.length ? cleaned : localQuizFallback({ title, content, count });
}

// --- Local fallback (free/offline) ---
function localQuizFallback({ title, content, count }) {
  if (!content || content.trim().length < 10) return [];
  
  const cleanContent = content.trim().replace(/\s+/g, ' ');
  
  // Try to split by sentences first
  let sentences = cleanContent
    .split(/(?<=[.!?])\s+|[\r\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15); // Reduced threshold for more flexibility

  // If no good sentences found, try splitting by paragraphs or long phrases
  if (sentences.length === 0) {
    // Split by double newlines (paragraphs) or single newlines
    sentences = cleanContent
      .split(/\n\n+|\r\n\r\n+/)
      .map(s => s.trim().replace(/\s+/g, ' '))
      .filter(s => s.length > 20);
  }

  // If still no good segments, try splitting by commas or semicolons
  if (sentences.length === 0) {
    sentences = cleanContent
      .split(/[,;]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
  }

  // If still no good segments, create questions from content chunks
  if (sentences.length === 0 && cleanContent.length >= 30) {
    // Split content into chunks - ensure we get at least some chunks
    const minChunkSize = Math.max(30, Math.floor(cleanContent.length / Math.max(count, 1)));
    sentences = [];
    for (let i = 0; i < cleanContent.length; i += minChunkSize) {
      const chunk = cleanContent.slice(i, i + minChunkSize).trim();
      if (chunk.length >= 20) {
        sentences.push(chunk);
      }
    }
  }

  // If we still have no segments but content exists, create at least one question from the whole content
  if (sentences.length === 0 && cleanContent.length >= 20) {
    sentences = [cleanContent.substring(0, 200)];
  }

  // Limit to requested count
  const picks = sentences.slice(0, Math.min(count, sentences.length));
  
  if (picks.length === 0) return [];
  
  return picks.map((s, idx) => {
    // Create a meaningful question from the content
    const questionText = s.length > 100 
      ? `What is the main point of this statement about "${(title || "this topic")}"?`
      : `Which statement best describes: "${s.substring(0, 80)}${s.length > 80 ? '...' : ''}"?`;
    
    const correct = s.length > 120 ? s.substring(0, 120) + "..." : s;
    const options = [
      correct,
      "A related but slightly different concept.",
      "An overly general or vague statement.",
      "An unrelated or incorrect detail."
    ];
    return {
      question: questionText,
      options,
      correctIndex: 0,
      explanation: `The correct answer is based on the content: "${s.substring(0, 100)}${s.length > 100 ? '...' : ''}"`,
      difficulty: "easy"
    };
  });
}

// Public API
export async function generateQuizzes({ title, content, count = QUIZ_QUESTIONS_PER_NOTE }) {
  if (!content || content.trim().length < 10) return [];
  const provider = (PROVIDER || "huggingface").toLowerCase();
  try {
    if (provider === "huggingface") return await huggingfaceQuizzes({ title, content, count });
    return localQuizFallback({ title, content, count });
  } catch (e) {
    console.error("Quiz generation failed, using fallback:", e.message);
    return localQuizFallback({ title, content, count });
  }
  
}


