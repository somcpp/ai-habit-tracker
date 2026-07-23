import Habit from "../models/Habit.model.js";
import Log from "../models/Log.model.js";

// @route   GET /api/habits
// @desc    Get all habits for the logged in user
export const getHabits = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "true";
    let filter = { userId: req.user._id };

    if (!includeArchived) {
      filter.isArchived = false;
    }

    const habits = await Habit.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/habits
// @desc    Create a new habit
export const createHabit = async (req, res) => {
  try {
    const { name, description, category, frequency, targetDays, color, icon } = req.body;

    const count = await Habit.countDocuments({ userId: req.user._id });

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      description,
      category,
      frequency,
      targetDays,
      color,
      icon,
      order: count,
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/habits/:id
// @desc    Update a habit
export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    Object.assign(habit, req.body);
    const updatedHabit = await habit.save();

    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/habits/:id/archive
// @desc    Toggle archive status of a habit
export const archiveHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    habit.isArchived = !habit.isArchived;
    const updatedHabit = await habit.save();

    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/habits/:id
// @desc    Delete a habit and its logs
export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    await Log.deleteMany({ habitId: req.params.id, userId: req.user._id });

    res.json({ message: "Habit removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
