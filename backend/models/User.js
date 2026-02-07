const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  // Onboarding / personalization
  workMode: String, // WFH / WFO / Hybrid
  taskComplexity: String,
  workdayGoal: String, // Calm / Balanced / High Output

  // OTP auth
  otp: String,
  otpExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);