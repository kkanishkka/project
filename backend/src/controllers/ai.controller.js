// src/controllers/ai.controller.js
import { z } from "zod";
import { pipeline } from "@xenova/transformers";

// ------------------ Zod Schemas ------------------
const explanationSchema = z.object({
  term: z.string().min(1),
});

const summarySchema = z.object({
  content: z.string().min(1),
});

const youtubeSchema = z.object({
  youtubeUrl: z.string().url(),
});

// ------------------ Local Model Pipelines ------------------
// We lazy-load models once and reuse them

let summarizerPromise = null;
let textGenPromise = null;

async function getSummarizer() {
  if (!summarizerPromise) {
    // Small summarization model (local, open-source)
    summarizerPromise = pipeline(
      "summarization",
      "Xenova/distilbart-cnn-6-6"
    );
  }
  return summarizerPromise;
}

async function getTextGen() {
  if (!textGenPromise) {
    // Text2text model for explanation-style outputs
    textGenPromise = pipeline("text2text-generation", "Xenova/flan-t5-base");
  }
  return textGenPromise;
}

// ------------------ Controllers ------------------

// Explain a term in simple language
export const getExplanation = async (req, res, next) => {
  try {
    const { term } = explanationSchema.parse(req.body);

    const textGen = await getTextGen();
    const prompt = `Explain the term "${term}" in very simple, beginner-friendly language. 3–5 sentences.`;

    const output = await textGen(prompt, {
      max_new_tokens: 128,
    });

    const explanation =
      Array.isArray(output) && output[0]?.generated_text
        ? output[0].generated_text.trim()
        : "Could not generate explanation.";

    // Related concepts — cheap trick: ask the same model
    const relatedPrompt = `List 3 related concepts to "${term}" as a comma-separated list.`;
    const relatedOut = await textGen(relatedPrompt, {
      max_new_tokens: 64,
    });

    const relatedRaw =
      Array.isArray(relatedOut) && relatedOut[0]?.generated_text
        ? relatedOut[0].generated_text
        : "";

    const related = relatedRaw
      .replace(/\n/g, ",")
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0)
      .slice(0, 3);

    res.json({ explanation, related });
  } catch (e) {
    next(e);
  }
};

// Summarize a note's content using LOCAL Xenova model (no HF HTTP)
export const generateNoteSummary = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);

    const summarizer = await getSummarizer();
    const text =
      content.length > 3500 ? content.slice(0, 3500) : content;

    const output = await summarizer(text, {
      max_length: 250,
      min_length: 80,
    });

    const summary =
      Array.isArray(output) && output[0]?.summary_text
        ? output[0].summary_text.trim()
        : "No summary generated.";

    return res.json({ summary });
  } catch (err) {
    console.error("Error in generateNoteSummary (local):", err);
    next(err);
  }
};

// Summarize arbitrary text (AI tools “Summarize”) – also local
export const summarizeText = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);

    const summarizer = await getSummarizer();
    const text =
      content.length > 3500 ? content.slice(0, 3500) : content;

    const output = await summarizer(text, {
      max_length: 250,
      min_length: 80,
    });

    const summary =
      Array.isArray(output) && output[0]?.summary_text
        ? output[0].summary_text.trim()
        : "No summary generated.";

    res.json({ summary });
  } catch (e) {
    next(e);
  }
};

// Summarize YouTube video from URL (still local summarizer)
export const summarizeYouTube = async (req, res, next) => {
  try {
    const { youtubeUrl } = youtubeSchema.parse(req.body);

    // Extract video ID from standard or short URL
    const match = youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    const videoId = match?.[1];

    if (!videoId) {
      return res
        .status(400)
        .json({ error: "Invalid YouTube URL format" });
    }

    // dynamic import so build doesn’t break if missing
    const { YoutubeTranscript } = await import("youtube-transcript");

    let transcript;
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (err) {
      console.error("Transcript fetch error:", err.message);
      return res.status(404).json({
        error:
          "Transcript is disabled or unavailable for this video.",
      });
    }

    if (!transcript || transcript.length === 0) {
      return res
        .status(404)
        .json({ error: "Transcript not available for this video" });
    }

    const fullText = transcript.map((t) => t.text).join(" ");

    const summarizer = await getSummarizer();

    const trimmed =
      fullText.length > 7000 ? fullText.slice(0, 7000) : fullText;

    const output = await summarizer(trimmed, {
      max_length: 250,
      min_length: 80,
    });

    const summary =
      Array.isArray(output) && output[0]?.summary_text
        ? output[0].summary_text.trim()
        : "No summary generated.";

    res.json({ summary });
  } catch (e) {
    next(e);
  }
};
