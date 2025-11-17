// src/controllers/youtubeSummary.controller.js
import { YoutubeTranscript } from "youtube-transcript";
import { pipeline } from "@xenova/transformers";

// -------- Load summarization model once (global cache) --------
let summarizerPromise = null;

async function getSummarizer() {
  if (!summarizerPromise) {
    // Small, fast open-source summarization model
    summarizerPromise = pipeline(
      "summarization",
      "Xenova/distilbart-cnn-6-6"
    );
  }
  return summarizerPromise;
}

// -------- Helper to extract video ID from URL --------
function getVideoIdFromUrl(url) {
  try {
    const u = new URL(url);

    // short link: https://youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      return u.pathname.replace("/", "");
    }

    // normal: https://www.youtube.com/watch?v=VIDEO_ID
    const v = u.searchParams.get("v");
    return v;
  } catch {
    return null;
  }
}

// -------- Main controller --------
export const getYouTubeSummary = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // 1) Fetch transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      return res
        .status(404)
        .json({ error: "No transcript available for this video." });
    }

    let transcriptText = transcriptItems.map((t) => t.text).join(" ");

    // limit very long videos so model doesn’t die
    const MAX_INPUT_CHARS = 3500;
    if (transcriptText.length > MAX_INPUT_CHARS) {
      transcriptText = transcriptText.slice(0, MAX_INPUT_CHARS);
    }

    // 2) Summarise using local open-source model
    const summarizer = await getSummarizer();

    const output = await summarizer(transcriptText, {
      max_length: 250, // you can tune these
      min_length: 80,
    });

    const summaryObj = Array.isArray(output) ? output[0] : output;
    const summary =
      summaryObj.summary_text || summaryObj.generated_text || "";

    if (!summary) {
      return res
        .status(500)
        .json({ error: "Model did not return a summary." });
    }

    return res.json({ summary });
  } catch (err) {
    console.error("YouTube summary error:", err);
    return res
      .status(500)
      .json({ error: "Failed to summarize YouTube video." });
  }
};
