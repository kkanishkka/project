// src/models/QuizQuestion.js
import mongoose from 'mongoose';

const QuizQuestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', index: true },
  noteTitle: { type: String }, // Store note name for easy access
  type: { type: String, enum: ['mcq', 'boolean'], required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
  explanation: { type: String }
}, { timestamps: true });

export default mongoose.model('QuizQuestion', QuizQuestionSchema);
