// routes/notes.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createNote, listNotes, getNote, updateNote, deleteNote, generateSummary } from "../controllers/notes.controller.js";

const router = Router();

// Protect all routes below
router.use(requireAuth);

router.post("/", createNote);
router.get("/", listNotes);
// IMPORTANT: specific routes must come before parameterized routes
router.post("/note-summary", generateSummary);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
