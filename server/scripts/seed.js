import mongoose from "mongoose";
import dotenv from "dotenv";
import { format, subDays } from "date-fns";
import User from "../models/User.model.js";
import Habit from "../models/Habit.model.js";
import Log from "../models/Log.model.js";

dotenv.config();

const todayKey = () => format(new Date(), "yyyy-MM-dd");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Check if demo user already exists and clear only their data if so
    let existingDemoUser = await User.findOne({ email: "demo@example.com" });
    if (existingDemoUser) {
      await Habit.deleteMany({ userId: existingDemoUser._id });
      await Log.deleteMany({ userId: existingDemoUser._id });
      await User.deleteOne({ _id: existingDemoUser._id });
      console.log("Cleared existing demo user data (other users were kept safe)...");
    }

    // Create Demo User
    const demoUser = await User.create({
      name: "Demo User",
      email: "demo@example.com",
      password: "password123", // Will be hashed by pre-save hook
      avatar: "D",
      morningMotivation: true,
    });
    console.log("Demo user created: demo@example.com / password123");

    // Define mock habits
    const mockHabitsData = [
      {
        name: "Drink 2L of water",
        description: "Stay hydrated throughout the day.",
        category: "Health",
        color: "#0ea5e9",
        icon: "💧",
        order: 0,
        _streakProb: 0.95,
      },
      {
        name: "Morning run",
        description: "30-minute run before breakfast.",
        category: "Fitness",
        targetDays: 5,
        color: "#ef4444",
        icon: "🏃",
        order: 1,
        _streakProb: 0.7,
        _pattern: "weekdays",
        _brokeAt: 20,
      },
      {
        name: "Read 20 minutes",
        description: "Fiction or non-fiction, no phone.",
        category: "Learning",
        color: "#6366f1",
        icon: "📚",
        order: 2,
        _streakProb: 0.82,
      },
      {
        name: "Meditate",
        description: "10 minutes of breath-focused meditation.",
        category: "Mindfulness",
        color: "#8b5cf6",
        icon: "🧘",
        order: 3,
        _streakProb: 0.6,
      },
      {
        name: "Journal",
        description: "Write 3 things I'm grateful for.",
        category: "Mindfulness",
        targetDays: 5,
        color: "#ec4899",
        icon: "✍️",
        order: 4,
        _streakProb: 0.75,
        _pattern: "dropoff",
      },
      {
        name: "Strength training",
        description: "Push/pull/legs split.",
        category: "Fitness",
        frequency: "weekly",
        targetDays: 3,
        color: "#f59e0b",
        icon: "💪",
        order: 5,
        _streakProb: 0.55,
        _pattern: "weekdays",
      },
      {
        name: "Side project — 1hr",
        description: "Ship something small every day.",
        category: "Productivity",
        targetDays: 6,
        color: "#14b8a6",
        icon: "🎯",
        order: 6,
        _streakProb: 0.78,
      },
    ];

    // Insert habits
    const insertedHabits = [];
    for (const hData of mockHabitsData) {
      const { _streakProb, _pattern, _brokeAt, ...habitFields } = hData;
      const habit = await Habit.create({
        ...habitFields,
        userId: demoUser._id,
      });
      insertedHabits.push({ ...habit.toObject(), _streakProb, _pattern, _brokeAt });
    }
    console.log(`Inserted ${insertedHabits.length} habits...`);

    // Generate deterministic-ish logs over the last 90 days
    const logsToInsert = [];
    const today = new Date();

    for (const h of insertedHabits) {
      for (let i = 0; i < 90; i++) {
        const d = subDays(today, i);
        const dow = d.getDay();
        const key = format(d, "yyyy-MM-dd");
        let p = h._streakProb;
        
        if (h._pattern === "weekdays" && (dow === 0 || dow === 6)) p *= 0.35;
        if (h._pattern === "dropoff" && i < 14) p *= 0.25;
        if (h._brokeAt && i >= h._brokeAt - 2 && i <= h._brokeAt + 2) continue;

        const seed = Math.sin(i * 9301 + h.name.length * 49297) * 233280;
        const rnd = seed - Math.floor(seed);
        
        if (rnd < p) {
          logsToInsert.push({
            userId: demoUser._id,
            habitId: h._id,
            completedDate: key,
          });
        }
      }
    }

    // Make sure first 4 habits are checked off today for an interesting Today view
    const today_ = todayKey();
    for (let i = 0; i < 4; i++) {
      const h = insertedHabits[i];
      const exists = logsToInsert.find(l => l.habitId.toString() === h._id.toString() && l.completedDate === today_);
      if (!exists) {
        logsToInsert.push({
          userId: demoUser._id,
          habitId: h._id,
          completedDate: today_,
        });
      }
    }

    await Log.insertMany(logsToInsert);
    console.log(`Inserted ${logsToInsert.length} logs...`);

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
