const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Task = require("../models/Task");

router.use(auth);

router.post("/", async (req, res) => {
  const task = await Task.create({
    ...req.body,
    userId: req.userId
  });
  res.json(task);
});

router.get("/", async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});

router.put("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(task);
});

module.exports = router;