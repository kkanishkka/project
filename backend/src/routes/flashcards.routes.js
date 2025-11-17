import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getByNote, regenerate } from "../controllers/flashcards.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/notes/:noteId/flashcards", getByNote);
router.post("/notes/:noteId/flashcards/regenerate", regenerate);

export default router;
