// routes/notes.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createNote, listNotes, getNote, updateNote, deleteNote, generateSummary, generateAISummary } from "../controllers/notes.controller.js";

const router = Router();

// Protect all routes below
router.use(requireAuth);

router.post("/", createNote);
router.get("/", listNotes);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/note-summary", generateSummary);

export default router;
