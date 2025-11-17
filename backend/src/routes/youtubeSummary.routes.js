// src/routes/youtubeSummary.routes.js
import express from "express";
import { getYouTubeSummary } from "../controllers/youtubeSummary.controller.js";

const router = express.Router();

// POST /api/youtube-summary
router.post("/youtube-summary", getYouTubeSummary);

export default router;
