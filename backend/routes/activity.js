const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ActivityLog = require("../models/ActivityLog");

router.use(auth);

/**
 * Log user activity events
 * type: MOUSE | KEYBOARD | ERROR
 */
router.post("/", async (req, res) => {
  const { type, metadata } = req.body;

  if (!type) {
    return res.status(400).json({ message: "Activity type required" });
  }

  await ActivityLog.create({
    userId: req.userId,
    type,
    metadata
  });

  res.json({ message: "Activity logged" });
});

module.exports = router;
