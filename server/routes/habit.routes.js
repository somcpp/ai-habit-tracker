import express from "express";
import {
  getHabits,
  createHabit,
  updateHabit,
  archiveHabit,
  deleteHabit,
} from "../controllers/habit.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.use(isAuthenticated); // Protect all habit routes

router.route("/").get(getHabits).post(createHabit);
router.route("/:id").put(updateHabit).delete(deleteHabit);
router.put("/:id/archive", archiveHabit);

export default router;
