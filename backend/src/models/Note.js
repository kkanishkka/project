// models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String },
    tags: [String],

    // old manual revision date (you already had this)
    revisionDate: { type: Date },

    // Flashcards info
    flashcardCount: { type: Number, default: 0 },
    flashcardsUpdatedAt: { type: Date },

    // 🔹 Spaced repetition fields
    lastReviewedAt: { type: Date, default: null },      // last time user clicked Review
    nextReviewAt: { type: Date, default: null },        // next scheduled review date
    reviewIntervalDays: { type: Number, default: 1 },   // current interval in days
    reviewCount: { type: Number, default: 0 }, 
     reviewMode: {
    type: String,
    enum: ['light', 'standard', 'intense'],
    default: 'standard',
  },         // how many reviews done

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
