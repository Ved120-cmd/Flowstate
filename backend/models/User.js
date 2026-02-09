const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  // User Identity
  displayName: {
    type: String,
    default: ""
  },

  // Questionnaire / Onboarding Data
  workMode: String, // e.g., "wfh, hybrid" or "Work from Home, Hybrid"
  
  workHours: {
    start: {
      type: String,
      default: "09:00"
    },
    end: {
      type: String,
      default: "17:00"
    }
  },
  
  scheduleType: {
    type: String,
    enum: ['fixed', 'flexible', 'Fixed', 'Flexible'],
    default: 'flexible'
  },
  
  taskComplexity: String, // e.g., "routine, mixed" or "Routine tasks, Mixed workload"
  
  workIntensity: {
    type: String,
    enum: ['deep', 'switching', 'balanced', 'Deep focus sessions', 'Task switching', 'Balanced approach'],
    default: 'balanced'
  },
  
  nudgeSensitivity: {
    type: String,
    enum: ['minimal', 'balanced', 'active', 'Minimal', 'Balanced', 'Active guidance'],
    default: 'balanced'
  },
  
  workdayGoal: {
    type: String,
    enum: ['calm', 'output', 'balanced', 'Calm & steady', 'High output', 'Balanced'],
    default: 'balanced'
  },

  // Features
  flowLockEnabled: {
    type: Boolean,
    default: true
  },

  // OTP auth
  otp: String,
  otpExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("User", userSchema);