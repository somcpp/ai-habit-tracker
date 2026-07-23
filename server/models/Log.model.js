import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true },
    completedDate: { type: String, required: true }, // Format: YYYY-MM-DD
  },
  { timestamps: true }
);

// Prevent duplicate logs for the same habit on the same day
logSchema.index({ userId: 1, habitId: 1, completedDate: 1 }, { unique: true });

export default mongoose.model("Log", logSchema);
