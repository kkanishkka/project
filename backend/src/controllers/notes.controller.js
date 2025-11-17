// controllers/notes.controller.js
import { z } from "zod";
import Note from "../models/Note.js";
import Revision from "../models/Revision.js";

const createSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  revisionDate: z.string().optional(), // ISO date string
});

const summarySchema = z.object({
  content: z.string().min(1),
});

// 🔹 for review endpoint
const reviewSchema = z.object({
  difficulty: z.enum(["hard", "medium", "easy"]),
});

// Helper function to strip HTML tags from content
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

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

    // Generate flashcards (non-blocking - don't fail note creation if this fails)
    try {
      const { generateFlashcards } = await import("../services/ai.service.js");
      const Flashcard = (await import("../models/Flashcard.js")).default;
      const cleanContent = stripHtml(note.content || "");
      if (cleanContent.length >= 10) {
        const aiCards = await generateFlashcards({
          title: note.title || "Untitled",
          content: cleanContent,
        });
        if (aiCards && aiCards.length > 0) {
          const docs = await Flashcard.insertMany(
            aiCards.map((c) => ({
              user: req.user.id,
              note: note._id,
              question: c.question?.trim().slice(0, 400) || "Q?",
              answer: c.answer?.trim().slice(0, 800) || "A",
              tag: c.tag?.trim() || undefined,
            }))
          );
          note.flashcardCount = docs.length;
          note.flashcardsUpdatedAt = new Date();
          await note.save();
        }
      }
    } catch (flashcardError) {
      console.error(
        "Flashcard generation failed during note creation:",
        flashcardError
      );
      note.flashcardCount = 0;
      await note.save();
    }

    res.status(201).json(note);
  } catch (e) {
    next(e);
  }
};

// LIST (only my notes)
export const listNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json(notes);
  } catch (e) {
    next(e);
  }
};

// GET one (only if I own it)
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json(note);
  } catch (e) {
    next(e);
  }
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
      await Revision.deleteMany({
        user: req.user.id,
        note: note._id,
        status: "pending",
      });
      if (data.revisionDate) {
        await Revision.create({
          user: req.user.id,
          note: note._id,
          scheduledFor: new Date(data.revisionDate),
          status: "pending",
        });
      }
    }

    // Regenerate flashcards if title or content changed (non-blocking)
    if (data.title || data.content) {
      try {
        const { generateFlashcards } = await import("../services/ai.service.js");
        const Flashcard = (await import("../models/Flashcard.js")).default;
        await Flashcard.deleteMany({ note: note._id, user: req.user.id });
        const cleanContent = stripHtml(note.content || "");
        if (cleanContent.length >= 10) {
          const aiCards = await generateFlashcards({
            title: note.title || "Untitled",
            content: cleanContent,
          });
          if (aiCards && aiCards.length > 0) {
            const docs = await Flashcard.insertMany(
              aiCards.map((c) => ({
                user: req.user.id,
                note: note._id,
                question: c.question?.trim().slice(0, 400) || "Q?",
                answer: c.answer?.trim().slice(0, 800) || "A",
                tag: c.tag?.trim() || undefined,
              }))
            );
            note.flashcardCount = docs.length;
            note.flashcardsUpdatedAt = new Date();
            await note.save();
          } else {
            note.flashcardCount = 0;
            await note.save();
          }
        } else {
          note.flashcardCount = 0;
          await note.save();
        }
      } catch (flashcardError) {
        console.error(
          "Flashcard generation failed during note update:",
          flashcardError
        );
        note.flashcardCount = 0;
        await note.save();
      }
    }

    res.json(note);
  } catch (e) {
    next(e);
  }
};

// DELETE (only mine)
export const deleteNote = async (req, res, next) => {
  try {
    const result = await Note.deleteOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!result.deletedCount)
      return res.status(404).json({ error: "Not found" });

    // Cascade delete revisions and flashcards for this note
    await Revision.deleteMany({ user: req.user.id, note: req.params.id });
    const Flashcard = (await import("../models/Flashcard.js")).default;
    await Flashcard.deleteMany({ user: req.user.id, note: req.params.id });

    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

// 🔹 MARK NOTE AS REVIEWED (spaced repetition)
export const reviewNote = async (req, res, next) => {
  try {
    const { difficulty } = reviewSchema.parse(req.body);

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ error: "Not found" });
    }

    // simple interval logic
    let intervalDays = 1;
    if (difficulty === "medium") intervalDays = 3;
    if (difficulty === "easy") intervalDays = 7;

    const now = new Date();
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);

    note.lastReviewedAt = now;
    note.nextReviewAt = nextReview; // 👈 stored on note
    note.reviewIntervalDays = intervalDays;
    note.reviewCount = (note.reviewCount || 0) + 1;

    await note.save();
    res.json(note);
  } catch (e) {
    next(e);
  }
};

// 🔹 CLEAR REVIEW DATA (remove from review queue)
export const clearReviewNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        $set: {
          nextReviewAt: null,
          reviewIntervalDays: null,
        },
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(note);
  } catch (e) {
    next(e);
  }
};

// GENERATE SUMMARY (legacy route)
export const generateSummary = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);
    const summary =
      content.length > 100 ? content.substring(0, 100) + "..." : content;
    res.json({ summary });
  } catch (e) {
    next(e);
  }
};

// GENERATE SUMMARY (for /api/summarize endpoint)
export const generateAISummary = async (req, res, next) => {
  try {
    const { content } = summarySchema.parse(req.body);
    const summary =
      content.length > 100 ? content.substring(0, 100) + "..." : content;
    res.json({ summary });
  } catch (e) {
    next(e);
  }
};
