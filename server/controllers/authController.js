import redis from "../config/redis.js";
import { generateOTP } from "../utils/generateOtp.js";

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = generateOTP();

    await redis.set(`otp:${email}`, otp, "EX", 300);

    console.log("OTP:", otp);

    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};