const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE TASK
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, complexity } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      description: description || "",
      complexity: complexity || "medium",
      status: "pending",
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({
      error: "Failed to create task",
      details: err.message,
    });
  }
});

// GET TASKS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(tasks);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// START TASK
router.put("/:id/start", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "active", startedAt: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("START TASK ERROR:", err);
    res.status(500).json({ error: "Failed to start task" });
  }
});

// COMPLETE TASK
router.put("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "completed", completedAt: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("COMPLETE TASK ERROR:", err);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

module.exports = router;
