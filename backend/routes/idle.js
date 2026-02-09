const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ActivityLog = require("../models/ActivityLog");

router.use(auth);

/**
 * Log idle start
 */
router.post("/", async (req, res) => {
  await ActivityLog.create({
    userId: req.userId,
    type: "IDLE"
  });

  res.json({ message: "Idle event logged" });
});

module.exports = router;