import { Router } from "express";
import { register, login, me, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// helpful for frontend to restore session (uses Bearer token in header)
router.get("/me", requireAuth, me);

// not strictly needed (you’re using Bearer tokens), but nice to have
router.post("/logout", logout);

export default router;
