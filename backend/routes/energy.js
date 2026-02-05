const express = require("express");
const WorkSession = require("../models/WorkSession");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Update energy score (called by teammate logic)
router.post("/update", auth, async (req, res) => {
  const { energyScore } = req.body;

  const session = await WorkSession.findOne({
    userId: req.user.userId,
    endedAt: null,
  });

  if (!session) {
    return res.status(404).json({ message: "No active session" });
  }

  session.energyScore = energyScore;
  await session.save();

  res.json(session);
});

module.exports = router;
