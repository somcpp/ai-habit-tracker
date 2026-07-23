import Log from "../models/Log.model.js";
import Habit from "../models/Habit.model.js";
import { format, subDays, differenceInCalendarDays, parseISO } from "date-fns";

const todayKey = () => format(new Date(), "yyyy-MM-dd");

// Helper to calculate streaks
const calculateStreak = (dateKeys) => {
  if (!dateKeys?.length) return { current: 0, longest: 0 };
  
  const set = new Set(dateKeys);
  const today = todayKey();
  const yKey = format(subDays(new Date(), 1), "yyyy-MM-dd");
  
  let current = 0;
  let cursor = new Date();
  
  if (!set.has(today) && !set.has(yKey)) {
    current = 0;
  } else {
    if (!set.has(today)) {
      cursor = subDays(cursor, 1);
    }
    while (set.has(format(cursor, "yyyy-MM-dd"))) {
      current += 1;
      cursor = subDays(cursor, 1);
    }
  }
  
  const sorted = [...dateKeys].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  
  for (const k of sorted) {
    if (prev) {
      const diff = differenceInCalendarDays(parseISO(k), parseISO(prev));
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = k;
  }
  
  return { current, longest };
};

// @route   POST /api/logs
// @desc    Mark habit as completed
export const createLog = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();

    const existingLog = await Log.findOne({
      userId: req.user._id,
      habitId,
      completedDate,
    });

    if (existingLog) {
      return res.json(existingLog);
    }

    const log = await Log.create({
      userId: req.user._id,
      habitId,
      completedDate,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/logs
// @desc    Unmark habit
export const deleteLog = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();

    await Log.findOneAndDelete({
      userId: req.user._id,
      habitId,
      completedDate,
    });

    res.json({ message: "Unmarked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/logs/today
// @desc    Get logs for today
export const getTodayLogs = async (req, res) => {
  try {
    const today = todayKey();
    const logs = await Log.find({ userId: req.user._id, completedDate: today });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/logs/range
// @desc    Get logs within a date range
export const getLogsRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ message: "Start and end dates required" });
    }

    const logs = await Log.find({
      userId: req.user._id,
      completedDate: { $gte: start, $lte: end },
    });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/logs/heatmap
// @desc    Get completion counts for the last 90 days
export const getHeatmap = async (req, res) => {
  try {
    const days = [];
    const end = new Date();
    const startDate = format(subDays(end, 89), "yyyy-MM-dd");

    const logs = await Log.find({
      userId: req.user._id,
      completedDate: { $gte: startDate },
    });

    for (let i = 89; i >= 0; i--) {
      const d = subDays(end, i);
      const key = format(d, "yyyy-MM-dd");
      const count = logs.filter((l) => l.completedDate === key).length;
      days.push({ date: key, count });
    }

    res.json(days);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/logs/stats
// @desc    Get stats for the last 30 days
export const getStats = async (req, res) => {
  try {
    const days30 = [];
    const end = new Date();
    
    for (let i = 29; i >= 0; i--) {
      days30.push(format(subDays(end, i), "yyyy-MM-dd"));
    }
    
    const startDate = days30[0];
    const endDate = days30[days30.length - 1];

    const habits = await Habit.find({ userId: req.user._id, isArchived: false });
    const logs = await Log.find({
      userId: req.user._id,
    });

    const perHabit = habits.map((h) => {
      const hLogsAllTime = logs.filter((l) => l.habitId.toString() === h._id.toString());
      const hLogs30d = hLogsAllTime.filter(
        (l) => l.completedDate >= startDate && l.completedDate <= endDate
      );
      
      const keys = hLogsAllTime.map((l) => l.completedDate).sort().reverse();
      const { current, longest } = calculateStreak(keys);
      
      return {
        habitId: h._id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        category: h.category,
        completions30d: hLogs30d.length,
        currentStreak: current,
        longestStreak: longest,
      };
    });

    res.json({ perHabit, days: days30 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/logs/stats/:habitId
// @desc    Get stats for a specific habit
export const getHabitStats = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
    
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const hLogs = await Log.find({ habitId: habit._id, userId: req.user._id })
      .sort({ completedDate: -1 });

    const keys = hLogs.map((l) => l.completedDate);
    const { current, longest } = calculateStreak(keys);

    const totalCompletions = hLogs.length;
    // Basic completion rate calculation (total completions / days since created)
    const daysSinceCreated = Math.max(1, differenceInCalendarDays(new Date(), new Date(habit.createdAt)));
    const completionRate = Math.min(100, Math.round((totalCompletions / daysSinceCreated) * 100));

    res.json({
      habit,
      totalCompletions,
      currentStreak: current,
      longestStreak: longest,
      completionRate,
      monthly: {}, // Can be enhanced later
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
