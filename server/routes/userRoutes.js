import express from "express";
import User from "../models/User.js";
import redis from "../config/redis.js";
import { generateOTP } from "../utils/generateOtp.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import {
  calculateBMR,
  calculateTDEE,
  adjustCalories,
  calculateMacros,
} from "../utils/nutritionUtils.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ================= REGISTER SEND OTP =================
router.post("/register/send-otp", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const otp = generateOTP();
    await redis.set(`register:${username}`, JSON.stringify({ username, email, password, otp }), "EX", 300);
    await sendEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= REGISTER VERIFY OTP =================
router.post("/register/verify-otp", async (req, res) => {
  try {
    const { username, otp } = req.body;
    const data = await redis.get(`register:${username}`);
    if (!data) return res.status(400).json({ message: "OTP expired" });

    const parsedData = JSON.parse(data);
    if (parsedData.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(parsedData.password, 10);
    const newUser = new User({ ...parsedData, password: hashedPassword, createdAt: new Date(), foodLogs: [] });
    await newUser.save();
    await redis.del(`register:${username}`);

    const { password: pwd, ...userData } = newUser.toObject();
    res.json({ message: "User registered successfully", user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const { password: pwd, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= SEND OTP (RESET PASSWORD) =================
router.post("/send-otp", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    await redis.set(`otp:${username}`, otp, "EX", 300);
    await sendEmail(user.email, otp);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const { username, otp } = req.body;
    const storedOtp = await redis.get(`otp:${username}`);
    if (!storedOtp) return res.status(400).json({ message: "OTP expired" });
    if (storedOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= RESET PASSWORD =================
router.put("/reset/password", async (req, res) => {
  try {
    const { username, password, otp } = req.body;
    const storedOtp = await redis.get(`otp:${username}`);
    if (!storedOtp) return res.status(400).json({ message: "OTP expired" });
    if (storedOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate({ username }, { password: hashedPassword }, { new: true });
    await redis.del(`otp:${username}`);

    const { password: pwd, ...userData } = user.toObject();
    res.json({ message: "Password reset successful", user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPLOAD PROFILE IMAGE =================
router.post("/profile-image/:username", upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profileImage = req.file.filename;
    await user.save();

    res.json({
      message: "Image uploaded successfully",
      profileImage: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= GET USER PROFILE =================
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password: pwd, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE USER PROFILE =================
router.put("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });  
    if (!user) return res.status(404).json({ message: "User not found" });

    const updates = { ...req.body };
    if ("profileImage" in updates && !updates.profileImage) delete updates.profileImage;
    Object.assign(user, updates);

    // AUTO CALCULATE NUTRITION
    if (user.age && user.height && user.weight && user.gender && user.activityLevel) {
      const bmr = calculateBMR(user);
      const tdee = calculateTDEE(bmr, user.activityLevel);
      const finalCalories = adjustCalories(tdee, user.goalType);
      const macros = calculateMacros(finalCalories);

      if (!user.goals) user.goals = {};
      user.goals.daily = {
        calories: Math.round(finalCalories),
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      };
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= FOOD LOG =================
router.post("/food", async (req, res) => {
  try {
    const { username, name, calories, protein, carbs, fat, category, date } = req.body;
    if (!username || !name || calories == null || !category || !date) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.foodLogs)) user.foodLogs = [];
    user.foodLogs.push({ name, calories, protein: protein || 0, carbs: carbs || 0, fat: fat || 0, category, date });

    await user.save();
    res.json({ message: "Food added", foodLogs: user.foodLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= SAVE GOALS =================
router.post("/save-goals", async (req, res) => {
  try {
    const { username, goalType, goalData } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.goals) user.goals = {};
    user.goals[goalType] = goalData;
    await user.save();

    res.json({ message: "Goals saved", goals: user.goals });
  } catch (error) {
    res.status(500).json({ error: "Error saving goals" });
  }
});

// ================= GET GOALS =================
router.get("/get-goals/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json(user?.goals || {});
  } catch (error) {
    res.status(500).json({ error: "Error fetching goals" });
  }
});

export default router;