//Tracks each workday/session.

const mongoose = require("mongoose");

const workSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    endedAt: Date,

    meetingTimeMs: {
      type: Number,
      default: 0,
    },

    idleTimeMs: {
      type: Number,
      default: 0,
    },

    energyScore: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkSession", workSessionSchema);
