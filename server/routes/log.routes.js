import express from "express";
import {
  createLog,
  deleteLog,
  getTodayLogs,
  getLogsRange,
  getHeatmap,
  getStats,
  getHabitStats,
} from "../controllers/log.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.use(isAuthenticated);

router.route("/").post(createLog).delete(deleteLog);
router.get("/today", getTodayLogs);
router.get("/range", getLogsRange);
router.get("/heatmap", getHeatmap);
router.get("/stats", getStats);
router.get("/stats/:habitId", getHabitStats);

export default router;
