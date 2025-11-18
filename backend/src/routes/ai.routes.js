// backend/src/routes/ai.routes.js
import { Router } from "express";
import {
  getExplanation,
  generateNoteSummary,
  summarizeText,
  summarizeYouTube,
} from "../controllers/ai.controller.js";

const router = Router();

// Explain a term
router.post("/explanation", getExplanation);
router.post("/summarize", generateNoteSummary);

// Summarize a note using HuggingFace
router.post("/note-summary", generateNoteSummary);

// Summarize arbitrary text (local model)
router.post("/summarize-text", summarizeText);

// Summarize YouTube video
router.post("/summarize-youtube", summarizeYouTube);

export default router;
