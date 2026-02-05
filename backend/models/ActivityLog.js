//Tracks idle, activity, meeting mode, errors, etc.
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "MOUSE",
        "KEYBOARD",
        "IDLE",
        "TASK_START",
        "TASK_COMPLETE",
        "ERROR",
        "MEETING_ON",
        "MEETING_OFF",
        "SESSION_START",
        "SESSION_END",
      ],
      required: true,
    },

    metadata: {
      type: Object, // flexible for future use
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
