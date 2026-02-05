const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    workMode: {
      type: String,
      enum: ["WFH", "WFO", "HYBRID"],
      required: true,
    },

    workStart: String,
    workEnd: String,

    taskComplexityBaseline: {
      type: String,
      enum: ["LOW", "MIXED", "HIGH"],
      required: true,
    },

    workStyle: {
      type: String,
      enum: ["DEEP_FOCUS", "TASK_SWITCHING", "BALANCED"],
      required: true,
    },

    workdayFeeling: {
      type: String,
      enum: ["CALM", "BALANCED", "HIGH_OUTPUT"],
      required: true,
    },

    nudgePreference: {
      type: String,
      enum: ["MINIMAL", "BALANCED", "ACTIVE"],
      default: "BALANCED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
