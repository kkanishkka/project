import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    note:   { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true, index: true },
    question: { type: String, required: true },
    answer:   { type: String, required: true },
    tag:      { type: String },
    sourceVersion: { type: Number, default: 1 } // bump when regenerating after edits
  },
  { timestamps: true }
);

FlashcardSchema.index({ note: 1, createdAt: -1 });

export default mongoose.model("Flashcard", FlashcardSchema);
