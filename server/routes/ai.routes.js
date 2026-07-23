import express from "express";
import {
  getWeeklyReport,
  suggestHabits,
  getRecoveryPlan,
  chat,
  getMorningMotivation
} from "../controllers/ai.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/weekly-report", getWeeklyReport);
router.post("/suggest-habits", suggestHabits);
router.post("/recovery-plan", getRecoveryPlan);
router.post("/chat", chat);
router.get("/morning", getMorningMotivation);

export default router;
