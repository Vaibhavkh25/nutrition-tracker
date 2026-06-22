import mongoose from "mongoose";

// 🔹 Goal Schema
const goalSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
});

// 🔹 Food Log Schema
const foodLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  date: { type: String, required: true },
  category: { type: String, default: "" },
  timestamp: { type: String },
});

// 🔹 User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String },
  phone: { type: String },

  // ✅ NEW: Nutrition Profile
  profileImage: { type: String, default: "" },
  age: { type: Number },
  gender: { type: String }, // male / female / other
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  activityLevel: { type: String }, // low / moderate / high
  goalType: { type: String }, // lose / maintain / gain

  foodLogs: [foodLogSchema],

  // ✅ FIXED GOALS STRUCTURE
  goals: {
    daily: { type: goalSchema, default: () => ({}) },
    weekly: { type: goalSchema, default: () => ({}) },
    monthly: { type: goalSchema, default: () => ({}) },
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);