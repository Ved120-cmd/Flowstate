const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Energy = require("../models/Energy");

router.use(auth);

/**
 * Log energy snapshot
 */
router.post("/", async (req, res) => {
  const { level, source, reason } = req.body;

  if (level === undefined) {
    return res.status(400).json({ message: "Energy level required" });
  }

  await Energy.create({
    userId: req.userId,
    level,
    source,
    reason
  });

  res.json({ message: "Energy logged" });
});

/**
 * Get latest energy level
 */
router.get("/latest", async (req, res) => {
  const latest = await Energy.findOne({ userId: req.userId })
    .sort({ createdAt: -1 });

  res.json(latest);
});

module.exports = router;
