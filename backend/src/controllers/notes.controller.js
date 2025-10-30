// controllers/notes.controller.js
import { z } from "zod";
import Note from "../models/Note.js";
import Revision from "../models/Revision.js";

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  revisionDate: z.string().optional(), // ISO date string
});

const summarySchema = z.object({
  content: z.string().min(1),
});

// CREATE
export const createNote = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const note = await Note.create({ ...data, user: req.user.id });

    // Schedule initial revision if provided
    if (data.revisionDate) {
      await Revision.create({
        user: req.user.id,
        note: note._id,
        scheduledFor: new Date(data.revisionDate),
        status: "pending",
      });
    }
    res.status(201).json(note);
  } catch (e) { next(e); }
};

// LIST (only my notes)
export const listNotes = async (req, res, next) => {
  try {
    console.log('Fetching notes for user:', req.user.id, 'Type:', typeof req.user.id);
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    console.log('Found notes count:', notes.length);
    res.set('Cache-Control', 'no-store');
    res.status(200).json(notes);
  } catch (e) { 
    console.error('Error fetching notes:', e);
    next(e); 
  }
};

// GET one (only if I own it)
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json(note);
  } catch (e) { next(e); }
};

// UPDATE (only mine)
export const updateNote = async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body);
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      data,
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "Not found" });

    // If revisionDate updated explicitly, reschedule pending revisions for this note
    if (Object.prototype.hasOwnProperty.call(data, "revisionDate")) {
      // Remove existing pending revisions for this note
      await Revision.deleteMany({ user: req.user.id, note: note._id, status: "pending" });
      if (data.revisionDate) {
        await Revision.create({
          user: req.user.id,
          note: note._id,
          scheduledFor: new Date(data.revisionDate),
          status: "pending",
        });
      }
    }
    res.json(note);
  } catch (e) { next(e); }
};

// DELETE (only mine)
export const deleteNote = async (req, res, next) => {
  try {
    const result = await Note.deleteOne({ _id: req.params.id, user: req.user.id });
    if (!result.deletedCount) return res.status(404).json({ error: "Not found" });
    // Cascade delete revisions for this note
    await Revision.deleteMany({ user: req.user.id, note: req.params.id });
    res.status(204).end();
  } catch (e) { next(e); }
};

// GENERATE SUMMARY
export const generateSummary = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);

    // For now, return a simple summary. In a real app, you'd integrate with an AI service.
    const summary = content.length > 100
      ? content.substring(0, 100) + "..."
      : content;

    res.json({ summary });
  } catch (e) { next(e); }
};

// GENERATE SUMMARY (for /api/summarize endpoint)
export const generateAISummary = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);

    // For now, return a simple summary. In a real app, you'd integrate with an AI service.
    const summary = content.length > 100
      ? content.substring(0, 100) + "..."
      : content;

    res.json({ summary });
  } catch (e) { next(e); }
};

// COUNT (only my notes)
export const countNotes = async (req, res, next) => {
  try {
    const count = await Note.countDocuments({ user: req.user.id });
    res.json({ count });
  } catch (e) { next(e); }
};
