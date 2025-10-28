import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getExplanation,
  getNoteSummary,
  summarizeText,
  summarizeYouTube
} from "../controllers/ai.controller.js";

const router = Router();
router.use(requireAuth);

router.post("/explanation", getExplanation);
router.post("/note-summary", getNoteSummary);
router.post("/summarize", summarizeText);
router.post("/youtube-summary", summarizeYouTube);

export default router;
