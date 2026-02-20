<<<<<<< Updated upstream
import express from 'express';
const router = express.Router();
=======
import { Router } from "express";
import authRouter from "./authRouter.js";
import tutoringSessionRouter from "./tutoringSessionRouter.js";
>>>>>>> Stashed changes

const router = Router();

<<<<<<< Updated upstream
=======
// ─── Mount Component Routers ──────────────────────────────────────────────────
router.use("/auth", authRouter);
router.use("/tutoring-sessions", tutoringSessionRouter);

>>>>>>> Stashed changes
export default router;
