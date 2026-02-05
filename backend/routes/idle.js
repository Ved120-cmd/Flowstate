const express = require("express");
const WorkSession = require("../models/WorkSession");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { idleMs } = req.body;

  const session = await WorkSession.findOne({
    userId: req.user.userId,
    endedAt: null,
  });

  if (!session) {
    return res.status(404).json({ message: "No active session" });
  }

  session.idleTimeMs += idleMs;
  await session.save();

  res.json({ message: "Idle time updated" });
});

module.exports = router;
