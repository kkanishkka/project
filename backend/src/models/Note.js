// models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
    tags: [String],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // important link
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
