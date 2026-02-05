//Logs events (idle, error, meeting mode, etc.)

const express = require("express");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Log activity
router.post("/", auth, async (req, res) => {
  try {
    const { type, metadata } = req.body;

    await ActivityLog.create({
      userId: req.user.userId,
      type,
      metadata,
    });

    res.status(201).json({ message: "Activity logged" });
  } catch {
    res.status(500).json({ message: "Failed to log activity" });
  }
});

// Get recent activity
router.get("/", auth, async (req, res) => {
  const logs = await ActivityLog.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
});

module.exports = router;
