const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ActivityLog = require("../models/ActivityLog");

router.use(auth);

router.post("/start", async (req, res) => {
  await ActivityLog.create({
    userId: req.userId,
    type: "SESSION_START"
  });

  res.json({ message: "Session started" });
});

router.post("/end", async (req, res) => {
  await ActivityLog.create({
    userId: req.userId,
    type: "SESSION_END"
  });

  res.json({ message: "Session ended" });
});

module.exports = router;