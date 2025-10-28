import { z } from "zod";

const explanationSchema = z.object({
  term: z.string().min(1)
});

const summarySchema = z.object({
  content: z.string().min(1)
});

const youtubeSchema = z.object({
  youtubeUrl: z.string().url()
});

// Helper function to call Hugging Face API
const callHuggingFace = async (inputs, model = "facebook/bart-large-cnn") => {
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs }),
  });

  if (!response.ok) {
    throw new Error("Hugging Face API error");
  }

  const result = await response.json();
  return result[0]?.generated_text || result[0]?.summary_text || "No response generated";
};

export const getExplanation = async (req, res, next) => {
  try {
    const { term } = explanationSchema.parse(req.body);

    // Use a model for explanation (e.g., GPT-like model or custom)
    const prompt = `Explain the term "${term}" in simple terms:`;
    const explanation = await callHuggingFace(prompt, "microsoft/DialoGPT-medium");

    // For related concepts, we can use another call or simplify
    const relatedPrompt = `List 3 related concepts to "${term}":`;
    const relatedResponse = await callHuggingFace(relatedPrompt, "microsoft/DialoGPT-medium");
    const relatedConcepts = relatedResponse.split(',').map(c => c.trim()).slice(0, 3);

    res.json({
      explanation,
      related: relatedConcepts
    });
  } catch (e) {
    next(e);
  }
};

export const getNoteSummary = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);
    const summary = await callHuggingFace(content);
    res.json({ summary });
  } catch (e) {
    next(e);
  }
};

export const summarizeText = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);
    const summary = await callHuggingFace(content);
    res.json({ summary });
  } catch (e) {
    next(e);
  }
};

export const summarizeYouTube = async (req, res, next) => {
  try {
    const { youtubeUrl } = youtubeSchema.parse(req.body);

    // Extract video ID from URL
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Use youtube-transcript to get transcript
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map(item => item.text).join(' ');

    // Summarize the transcript
    const summary = await callHuggingFace(fullText);

    res.json({ summary });
  } catch (e) {
    next(e);
  }
};
