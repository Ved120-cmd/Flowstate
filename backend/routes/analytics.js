const express = require("express");
const WorkSession = require("../models/WorkSession");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/weekly", auth, async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const sessions = await WorkSession.find({
    userId: req.user.userId,
    createdAt: { $gte: oneWeekAgo },
  });

  const totalIdle = sessions.reduce((a, b) => a + b.idleTimeMs, 0);
  const avgEnergy =
    sessions.reduce((a, b) => a + b.energyScore, 0) /
    (sessions.length || 1);

  res.json({
    sessionsCount: sessions.length,
    totalIdleMinutes: Math.round(totalIdle / 60000),
    averageEnergy: Math.round(avgEnergy),
  });
});

module.exports = router;
