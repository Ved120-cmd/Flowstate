const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =======================
   Middleware
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   Routes
======================= */
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const activityRoutes = require("./routes/activity");
const sessionRoutes = require("./routes/session");
const idleRoutes = require("./routes/idle");
const meetingRoutes = require("./routes/meeting");
const energyRoutes = require("./routes/energy");
const analyticsRoutes = require("./routes/analytics");

/* =======================
   Auth Routes (PUBLIC)
   Must come BEFORE protected routes
======================= */
app.use("/api/auth", authRoutes);

/* =======================
   Application Routes
   (These should use auth middleware internally)
======================= */
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/idle", idleRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/analytics", analyticsRoutes);

/* =======================
   Health Check
======================= */
app.get("/", (req, res) => {
  res.send("FlowState Backend Running 🚀");
});

/* =======================
   Database Connection
======================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* =======================
   Server Start
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
