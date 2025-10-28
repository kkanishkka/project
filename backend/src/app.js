import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/notes.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import streakRoutes from "./routes/streak.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

// Security headers
app.use(helmet());

// CORS: single allowed origin; no cookies; allow Authorization header
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigin,
  credentials: false, // we are NOT using cookies
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Body parsing & logging
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
// (optional) make this explicit: app.use("/api/ai", aiRoutes);
app.use("/api", aiRoutes);
app.use("/api/streak", streakRoutes);

// 404 + error handler (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
