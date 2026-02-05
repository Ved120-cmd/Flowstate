const express = require("express");
const WorkSession = require("../models/WorkSession");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Start work session
router.post("/start", auth, async (req, res) => {
  const session = await WorkSession.create({
    userId: req.user.userId,
    startedAt: new Date(),
  });

  res.status(201).json(session);
});

// End work session
router.post("/end", auth, async (req, res) => {
  const session = await WorkSession.findOne({
    userId: req.user.userId,
    endedAt: null,
  });

  if (!session) {
    return res.status(404).json({ message: "No active session" });
  }

  session.endedAt = new Date();
  await session.save();

  res.json(session);
});

module.exports = router;
