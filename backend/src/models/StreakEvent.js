// models/StreakEvent.js
import mongoose from "mongoose";

const streakEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: ['note', 'review', 'quiz', 'ai_session', 'revision']
    },
    occurredAt: { type: Date, required: true, default: Date.now },
    metadata: {
      noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
      flashcardsReviewed: { type: Number },
      quizQuestions: { type: Number },
      editLength: { type: Number }, // For meaningful edit detection
      revisionScheduled: { type: Boolean }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
streakEventSchema.index({ user: 1, occurredAt: -1 });

export default mongoose.model("StreakEvent", streakEventSchema);
