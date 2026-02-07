const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateOTP } = require("../utils/otp");

/**
 * STEP 1: Request OTP (Register if new)
 */
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.endsWith("@company.com")) {
    return res.status(403).json({ message: "Company email required" });
  }

  let user = await User.findOne({ email });

  // Auto-register
  if (!user) {
    user = await User.create({ email });
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  await user.save();

  // 🔴 Hackathon: mock OTP delivery
  console.log(`OTP for ${email}: ${otp}`);

  res.json({ message: "OTP sent" });
});

/**
 * STEP 2: Verify OTP
 */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpiry: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  // Clear OTP
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  // Issue JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      email: user.email,
      workMode: user.workMode,
      workdayGoal: user.workdayGoal
    }
  });
});

module.exports = router;
