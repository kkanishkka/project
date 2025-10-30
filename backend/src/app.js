import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/notes.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import streakRoutes from "./routes/streak.routes.js";
import revisionRoutes from "./routes/revisions.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

// Disable ETag to avoid 304 Not Modified interfering with fetch()
app.set("etag", false);

/* -------------------- Security headers -------------------- */
app.use(helmet());

/* -------------------- CORS -------------------- */
/**
 * In production, set CLIENT_ORIGIN (e.g. https://app.example.com)
 * In development, we allow localhost/127.0.0.1 on any port.
 * IMPORTANT: never call `callback(null, false)` with cors() — use an Error to block.
 */
const DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const PROD_ALLOWED = process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : [];

app.use(
  cors({
    origin: (origin, cb) => {
      // Postman/curl have no Origin → allow
      if (!origin) return cb(null, true);

      // Strict prod origin if provided
      if (PROD_ALLOWED.length && PROD_ALLOWED.includes(origin)) return cb(null, true);

      // Dev: allow localhost/127.*
      if (DEV_ORIGIN_RE.test(origin)) return cb(null, true);

      // Block anything else
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: false, // not using cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Nice-to-have: respond to preflight for all routes
app.options("*", cors());

/* -------------------- Body parsing & logging -------------------- */
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

/* -------------------- Healthcheck -------------------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* -------------------- Routes -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
//app.use("/api/revisions", revisionRoutes);
app.use("/api", aiRoutes);          // (or app.use("/api/ai", aiRoutes))
app.use("/api/streak", streakRoutes);

/* -------------------- 404 + error handler (must be last) -------------------- */
app.use(notFound);
app.use(errorHandler);

export default app;
