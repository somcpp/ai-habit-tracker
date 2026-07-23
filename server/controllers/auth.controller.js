import User from "../models/User.model.js";
import { generateToken } from "../utils/generateToken.js";

// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const avatar = name.charAt(0).toUpperCase();

    const user = await User.create({
      name,
      email,
      password,
      avatar,
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        user,
        token: "mock-token-to-satisfy-frontend", // Frontend axios expects a token in payload sometimes, but we use cookies
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        user,
        token: "mock-token-to-satisfy-frontend",
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // req.user is set in isAuthenticated middleware
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.name) {
         user.avatar = req.body.name.charAt(0).toUpperCase();
      }

      if (req.body.morningMotivation !== undefined) {
        user.morningMotivation = req.body.morningMotivation;
      }

      const updatedUser = await user.save();

      res.json({ user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
