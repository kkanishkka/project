// routes/notes.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
  generateSummary,
  reviewNote,
  clearReviewNote,
} from "../controllers/notes.controller.js";

const router = Router();

// Protect all routes below
router.use(requireAuth);

router.post("/", createNote);
router.get("/", listNotes);

// Specific routes must come before parameterized routes
router.post("/note-summary", generateSummary);

// mark a note as reviewed (sets nextReviewAt based on difficulty)
router.put("/:id/review", reviewNote);

// remove note from review schedule (Done button)
router.put("/:id/clear-review", clearReviewNote);

router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
