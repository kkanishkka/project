// src/routes/quizzes.routes.js
import { Router } from 'express';
import { requireAuth as auth } from '../middleware/auth.js';
import { getQuizzes, generateQuizzes } from '../controllers/quizzes.controller.js';

const r = Router();
r.get('/quizzes', auth, getQuizzes);
r.post('/quizzes/:noteId/generate', auth, generateQuizzes);

export default r;
