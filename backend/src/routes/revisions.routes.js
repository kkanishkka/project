import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listRevisions,
  listDueRevisions,
  createRevision,
  completeRevision,
  skipRevision,
} from "../controllers/revisions.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listRevisions);
router.get("/due", listDueRevisions);
router.post("/", createRevision);
router.patch("/:id/complete", completeRevision);
router.patch("/:id/skip", skipRevision);

export default router;


