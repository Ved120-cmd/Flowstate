const mongoose = require("mongoose");

const energySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    level: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    source: {
      type: String,
      enum: ["SYSTEM", "USER", "INFERRED"],
      default: "SYSTEM"
    },

    reason: {
      type: String // e.g. "Long high-complexity task"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Energy", energySchema);
