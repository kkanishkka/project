// models/Revision.js
import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    scheduledFor: { type: Date, required: true },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
      index: true
    },
    // Optional metrics for spaced repetition quality (e.g., 1-5)
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

// Helpful index patterns
revisionSchema.index({ user: 1, scheduledFor: 1 });
revisionSchema.index({ user: 1, note: 1, scheduledFor: 1 });

export default mongoose.model("Revision", revisionSchema);


