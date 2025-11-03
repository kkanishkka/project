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


app.use(helmet());


const DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const PROD_ALLOWED = process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : [];

app.use(
  cors({
    origin: (origin, cb) => {
      
      if (!origin) return cb(null, true);

      
      if (PROD_ALLOWED.length && PROD_ALLOWED.includes(origin)) return cb(null, true);

     
      if (DEV_ORIGIN_RE.test(origin)) return cb(null, true);

      
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: false, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.options("*", cors());


app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));


app.get("/health", (_req, res) => res.json({ ok: true }));


app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/revisions", revisionRoutes);
app.use("/api", aiRoutes);         
app.use("/api/streak", streakRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;
