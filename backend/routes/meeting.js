const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ActivityLog = require("../models/ActivityLog");

router.use(auth);

router.post("/start", async (req, res) => {
  await ActivityLog.create({
    userId: req.userId,
    type: "MEETING_ON"
  });

  res.json({ message: "Meeting started" });
});

router.post("/end", async (req, res) => {
  await ActivityLog.create({
    userId: req.userId,
    type: "MEETING_OFF"
  });

  res.json({ message: "Meeting ended" });
});

module.exports = router;