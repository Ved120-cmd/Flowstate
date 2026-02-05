const express = require("express");
const WorkSession = require("../models/WorkSession");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

let meetingStart = {};

router.post("/start", auth, async (req, res) => {
  meetingStart[req.user.userId] = Date.now();
  res.json({ message: "Meeting mode ON" });
});

router.post("/end", auth, async (req, res) => {
  const start = meetingStart[req.user.userId];
  if (!start) return res.json({ message: "No meeting active" });

  const duration = Date.now() - start;

  const session = await WorkSession.findOne({
    userId: req.user.userId,
    endedAt: null,
  });

  if (session) {
    session.meetingTimeMs += duration;
    await session.save();
  }

  delete meetingStart[req.user.userId];
  res.json({ message: "Meeting mode OFF" });
});

module.exports = router;
