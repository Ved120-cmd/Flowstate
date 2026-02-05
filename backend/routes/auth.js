const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      email,
      name,
      workMode,
      workStart,
      workEnd,
      taskComplexityBaseline,
      workStyle,
      workdayFeeling,
      nudgePreference,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      name,
      workMode,
      workStart,
      workEnd,
      taskComplexityBaseline,
      workStyle,
      workdayFeeling,
      nudgePreference,
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
