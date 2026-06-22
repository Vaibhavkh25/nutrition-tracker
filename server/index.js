import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Test route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Routes
app.use("/api/users", userRoutes);

// ✅ MongoDB + Server Start
mongoose
  .connect("mongodb://127.0.0.1:27017/nutrition-app")
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(5000, () => {
      console.log("🚀 Server running on http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error("❌ DB Error:", err);
  });