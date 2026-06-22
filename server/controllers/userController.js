import User from "../models/User.js";

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = req.file.filename;
    const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

    await User.findByIdAndUpdate(userId, { profileImage: fileName });

    console.log("🔥 SAVED IMAGE:", fileName);

    res.json({
      message: "Image uploaded successfully",
      profileImage: fullUrl, // return full URL
    });

  } catch (error) {
    console.error("UPLOAD PROFILE IMAGE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};