// routes/streak.routes.js
import express from "express";
import { logEvent, getStreak, useFreezeToken, setTimezone } from "../controllers/streak.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.post('/events', logEvent);
router.get('/streak', getStreak);
router.post('/freeze', useFreezeToken);
router.post('/timezone', setTimezone);

export default router;
