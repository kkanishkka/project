import { z } from "zod";
import Revision from "../models/Revision.js";

const createRevisionSchema = z.object({
  noteId: z.string().min(1),
  scheduledFor: z.string().min(1), // ISO date string
  status: z.enum(["pending", "completed", "skipped"]).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const listRevisions = async (req, res, next) => {
  try {
    const revisions = await Revision.find({ user: req.user.id }).sort({ scheduledFor: 1 });
    res.json(revisions);
  } catch (e) { next(e); }
};

export const listDueRevisions = async (req, res, next) => {
  try {
    const today = new Date();
    const revisions = await Revision.find({
      user: req.user.id,
      status: "pending",
      scheduledFor: { $lte: today },
    }).sort({ scheduledFor: 1 }).populate("note", "title");
    res.json(revisions);
  } catch (e) { next(e); }
};

export const createRevision = async (req, res, next) => {
  try {
    const payload = createRevisionSchema.parse(req.body);
    const revision = await Revision.create({
      user: req.user.id,
      note: payload.noteId,
      scheduledFor: new Date(payload.scheduledFor),
      status: payload.status || "pending",
      rating: payload.rating,
    });
    res.status(201).json(revision);
  } catch (e) { next(e); }
};

export const completeRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: "completed", completedAt: new Date() },
      { new: true }
    );
    if (!revision) return res.status(404).json({ error: "Not found" });
    res.json(revision);
  } catch (e) { next(e); }
};

export const skipRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: "skipped" },
      { new: true }
    );
    if (!revision) return res.status(404).json({ error: "Not found" });
    res.json(revision);
  } catch (e) { next(e); }
};


