//Handles task CRUD and state changes.

const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Create Task
router.post("/", auth, async (req, res) => {
  try {
    const { title, complexity } = req.body;

    const task = await Task.create({
      userId: req.user.userId,
      title,
      complexity,
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Get User Tasks
router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId }).sort({
    createdAt: -1,
  });
  res.json(tasks);
});

// Start Task
router.put("/:id/start", auth, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ message: "Task not found" });

  task.status = "IN_PROGRESS";
  task.startedAt = new Date();
  await task.save();

  res.json(task);
});

// Complete Task
router.put("/:id/complete", auth, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ message: "Task not found" });

  task.status = "COMPLETED";
  task.completedAt = new Date();
  await task.save();

  res.json(task);
});

module.exports = router;
