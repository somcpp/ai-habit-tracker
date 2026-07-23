import { GoogleGenAI } from "@google/genai";
import Habit from "../models/Habit.model.js";
import Log from "../models/Log.model.js";
import { config } from "dotenv";
config()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

const getUserContext = async (userId) => {
  const habits = await Habit.find({ userId, isArchived: false });
  const logs = await Log.find({ userId }).sort({ completedDate: -1 }).limit(100);
  return {
    habits: habits.map(h => ({ name: h.name, category: h.category, frequency: h.frequency })),
    logsCount: logs.length,
    recentLogs: logs.slice(0, 20).map(l => l.completedDate)
  };
};

export const getWeeklyReport = async (req, res) => {
  try {
    const context = await getUserContext(req.user._id);
    const prompt = `You are an AI habit tracking coach. The user has these habits: ${JSON.stringify(context.habits)}. They have ${context.logsCount} total logs, recently on: ${context.recentLogs.join(", ")}. Write a short, encouraging weekly report in markdown format (2-3 paragraphs) analyzing their progress. RETURN ONLY A JSON OBJECT in this exact format: {"content": "your markdown report here"}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const suggestHabits = async (req, res) => {
  try {
    const { goals, productiveTime, struggles } = req.body;
    const context = await getUserContext(req.user._id);
    const prompt = `You are an AI habit coach. 
    The user's goals are: "${goals}". 
    Their most productive time is: "${productiveTime}". 
    They have struggled with: "${struggles}". 
    The user's current habits are: ${JSON.stringify(context.habits)}. 
    Suggest 3 new, unique, and actionable habits they could start that directly align with their goals and productivity patterns. 
    RETURN ONLY A JSON OBJECT exactly in this format: 
    {
      "suggestions": [
        { "name": "habit name", "description": "short description", "frequency": "daily or weekly", "category": "category name", "icon": "a single emoji", "reason": "why this is good for them" }
      ]
    }`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecoveryPlan = async (req, res) => {
  try {
    const context = await getUserContext(req.user._id);
    const prompt = `You are an AI habit coach. The user is struggling to keep up with their habits: ${JSON.stringify(context.habits)}. Write a short, empathetic 3-day recovery plan in markdown format to help them get back on track. RETURN ONLY A JSON OBJECT in this exact format: {"content": "your markdown plan here"}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const chat = async (req, res) => {
  try {
    const { question } = req.body;
    const context = await getUserContext(req.user._id);
    const prompt = `You are an AI habit coach. The user asks: "${question}". Here is their habit context: ${JSON.stringify(context)}. Provide a helpful, concise answer in markdown format. RETURN ONLY A JSON OBJECT in this exact format: {"content": "your markdown answer here"}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMorningMotivation = async (req, res) => {
  try {
    const context = await getUserContext(req.user._id);
    const prompt = `You are an AI habit coach. The user's name is ${req.user.name}. Write a short, punchy 1-2 sentence morning motivation message for them based on their habits: ${JSON.stringify(context.habits)}. RETURN ONLY A JSON OBJECT in this exact format: {"content": "your message here"}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
