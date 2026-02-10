//Tracks user tasks + complexity.

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    complexity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "Low", "High" , "Medium"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "pending", "Pending"],
      default: "PENDING",
    },

    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);