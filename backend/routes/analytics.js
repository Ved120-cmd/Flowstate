const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Session = require("../models/WorkSession");

router.use(auth);

router.get("/summary", async (req, res) => {
  const sessions = await Session.find({ userId: req.userId });
  res.json({ sessions });
});

module.exports = router;