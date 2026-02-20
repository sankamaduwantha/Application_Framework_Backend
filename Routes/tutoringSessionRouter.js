import { Router } from "express";
import {
  createSession,
  getAllSessions,
  getSingleSession,
  updateSession,
  deleteSession,
  joinSession,
  leaveSession,
  getMySessions,
} from "../Controllers/tutoringSessionController.js";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";

const router = Router();

// ─── Session Routes ───────────────────────────────────────────────────────────

// GET  /api/v1/tutoring-sessions            → list all (with filter/search/pagination)
// POST /api/v1/tutoring-sessions            → create a new session
router.route("/").get(getAllSessions).post(protect, createSession);

// GET    /api/v1/tutoring-sessions/my       → sessions I tutor or joined
router.get("/my", getMySessions);

// GET    /api/v1/tutoring-sessions/:id      → single session detail
// PATCH  /api/v1/tutoring-sessions/:id      → update session (tutor/admin only)
// DELETE /api/v1/tutoring-sessions/:id      → delete session (tutor/admin only)
router
  .route("/:id")
  .get(getSingleSession)
  .patch(protect, updateSession)
  .delete(protect, authorizeRoles("admin", "organizer"), deleteSession);

// POST /api/v1/tutoring-sessions/:id/join   → join a session
// POST /api/v1/tutoring-sessions/:id/leave  → leave a session
router.post("/:id/join", protect, joinSession);
router.post("/:id/leave", protect, leaveSession);

export default router;
