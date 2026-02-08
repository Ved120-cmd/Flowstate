const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateOTP } = require("../utils/otp");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * STEP 1: Request OTP (Register if new)
 */
router.post("/request-otp", async (req, res) => {
  try {
    console.log("📧 Request OTP - Received:", req.body);
    
    const { email } = req.body;

    if (!email) {
      console.log("❌ No email provided");
      return res.status(400).json({ message: "Email is required" });
    }

    if (!email.endsWith("@company.com")) {
      console.log("❌ Invalid email domain:", email);
      return res.status(403).json({ message: "Company email required" });
    }

    console.log("🔍 Looking for user:", email);
    let user = await User.findOne({ email });

    // Auto-register
    if (!user) {
      console.log("✨ Creating new user:", email);
      user = await User.create({ email });
      console.log("✅ User created:", user._id);
    } else {
      console.log("✅ Existing user found:", user._id);
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    console.log("💾 Saving user with OTP...");
    await user.save();
    console.log("✅ User saved successfully");

    // 🔴 Hackathon: mock OTP delivery
    console.log(`\n🔑 OTP for ${email}: ${otp}\n`);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Request OTP error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      message: error.message || "Failed to send OTP. Please try again."
    });
  }
});

/**
 * STEP 2: Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  try {
    console.log("🔐 Verify OTP - Received:", req.body);
    
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    console.log("🔍 Looking for user with valid OTP...");
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: new Date() }
    });

    if (!user) {
      console.log("❌ Invalid or expired OTP");
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    console.log("✅ OTP verified for:", email);

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    console.log("🧹 OTP cleared");

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not set in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Issue JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🎟️ JWT token generated");

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        workMode: user.workMode,
        workdayGoal: user.workdayGoal
      }
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      message: error.message || "Failed to verify OTP. Please try again."
    });
  }
});

/**
 * STEP 3: Save Questionnaire Preferences
 */
router.post("/save-preferences", authMiddleware, async (req, res) => {
  try {
    console.log("💾 Save Preferences - User:", req.userId);
    console.log("📋 Data:", req.body);
    
    const { 
      displayName,
      workMode, 
      workHours, 
      hoursType,
      taskTypes, 
      workIntensity, 
      nudgeFrequency, 
      workDayGoal 
    } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      console.log("❌ User not found:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("📝 Updating user preferences...");

    // Map questionnaire answers to user model
    if (displayName) user.displayName = displayName;
    if (workMode) user.workMode = Array.isArray(workMode) ? workMode.join(', ') : workMode;
    if (workHours) user.workHours = workHours;
    if (hoursType) user.scheduleType = hoursType;
    if (taskTypes) user.taskComplexity = Array.isArray(taskTypes) ? taskTypes.join(', ') : taskTypes;
    if (workIntensity) user.workIntensity = workIntensity;
    if (nudgeFrequency) user.nudgeSensitivity = nudgeFrequency;
    if (workDayGoal) user.workdayGoal = workDayGoal;

    await user.save();
    console.log("✅ Preferences saved successfully");

    res.json({
      message: "Preferences saved successfully",
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        workMode: user.workMode,
        workHours: user.workHours,
        scheduleType: user.scheduleType,
        taskComplexity: user.taskComplexity,
        workIntensity: user.workIntensity,
        nudgeSensitivity: user.nudgeSensitivity,
        workdayGoal: user.workdayGoal
      }
    });
  } catch (error) {
    console.error("❌ Error saving preferences:", error);
    res.status(500).json({ 
      message: "Failed to save preferences",
      error: error.message 
    });
  }
});

/**
 * Get User Profile
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    console.log("👤 Get Profile - User:", req.userId);
    
    const user = await User.findById(req.userId).select('-otp -otpExpiry');
    
    if (!user) {
      console.log("❌ User not found:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile fetched successfully");

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        workMode: user.workMode,
        workHours: user.workHours,
        scheduleType: user.scheduleType,
        taskComplexity: user.taskComplexity,
        workIntensity: user.workIntensity,
        nudgeSensitivity: user.nudgeSensitivity,
        workdayGoal: user.workdayGoal,
        flowLockEnabled: user.flowLockEnabled
      }
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ 
      message: "Failed to fetch profile",
      error: error.message 
    });
  }
});

/**
 * Update User Profile
 */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    console.log("🔄 Update Profile - User:", req.userId);
    console.log("📝 Updates:", req.body);
    
    const updates = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      console.log("❌ User not found:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Update only allowed fields
    const allowedUpdates = [
      'displayName', 'workMode', 'workHours', 'scheduleType',
      'taskComplexity', 'workIntensity', 'nudgeSensitivity',
      'workdayGoal', 'flowLockEnabled'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();
    console.log("✅ Profile updated successfully");

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        workMode: user.workMode,
        workHours: user.workHours,
        scheduleType: user.scheduleType,
        taskComplexity: user.taskComplexity,
        workIntensity: user.workIntensity,
        nudgeSensitivity: user.nudgeSensitivity,
        workdayGoal: user.workdayGoal,
        flowLockEnabled: user.flowLockEnabled
      }
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ 
      message: "Failed to update profile",
      error: error.message 
    });
  }
});

module.exports = router;