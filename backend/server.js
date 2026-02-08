const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log environment check
console.log("🔍 Environment Check:");
console.log("  - NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("  - PORT:", process.env.PORT || 5000);
console.log("  - MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Not set");
console.log("  - JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not set");

// Check required environment variables
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  console.error("💡 Create a .env file in the backend directory with:");
  console.error("   MONGO_URI=mongodb://127.0.0.1:27017/flowstate");
  console.error("   JWT_SECRET=your-secret-key-here");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in .env file");
  console.error("💡 Add this to your .env file:");
  console.error("   JWT_SECRET=your-secret-key-here");
  process.exit(1);
}

// MongoDB connection
console.log("\n🔄 Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("   Database:", mongoose.connection.name);
    console.log("   Host:", mongoose.connection.host);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Make sure MongoDB is running");
    console.error("   2. Check your MONGO_URI in .env");
    console.error("   3. Try: mongodb://127.0.0.1:27017/flowstate");
    console.error("   4. Or use MongoDB Atlas cloud connection");
    process.exit(1);
  });

// Import routes
let authRoutes, taskRoutes, activityRoutes, sessionRoutes;
let idleRoutes, meetingRoutes, energyRoutes, analyticsRoutes, velocityRoutes;

try {
  authRoutes = require("./routes/auth");
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.error("❌ Error loading auth routes:", err.message);
}

try {
  taskRoutes = require("./routes/tasks");
  console.log("✅ Task routes loaded");
} catch (err) {
  console.warn("⚠️ Task routes not found (optional)");
}

try {
  activityRoutes = require("./routes/activity");
  console.log("✅ Activity routes loaded");
} catch (err) {
  console.warn("⚠️ Activity routes not found (optional)");
}

try {
  sessionRoutes = require("./routes/session");
  console.log("✅ Session routes loaded");
} catch (err) {
  console.warn("⚠️ Session routes not found (optional)");
}

try {
  idleRoutes = require("./routes/idle");
  console.log("✅ Idle routes loaded");
} catch (err) {
  console.warn("⚠️ Idle routes not found (optional)");
}

try {
  meetingRoutes = require("./routes/meeting");
  console.log("✅ Meeting routes loaded");
} catch (err) {
  console.warn("⚠️ Meeting routes not found (optional)");
}

try {
  energyRoutes = require("./routes/energy");
  console.log("✅ Energy routes loaded");
} catch (err) {
  console.warn("⚠️ Energy routes not found (optional)");
}

try {
  analyticsRoutes = require("./routes/analytics");
  console.log("✅ Analytics routes loaded");
} catch (err) {
  console.warn("⚠️ Analytics routes not found (optional)");
}

try {
  velocityRoutes = require("./routes/velocity");
  console.log("✅ Velocity routes loaded");
} catch (err) {
  console.warn("⚠️ Velocity routes not found (optional)");
}

// Register routes
if (authRoutes) app.use("/api/auth", authRoutes);
if (taskRoutes) app.use("/api/tasks", taskRoutes);
if (activityRoutes) app.use("/api/activity", activityRoutes);
if (sessionRoutes) app.use("/api/session", sessionRoutes);
if (idleRoutes) app.use("/api/idle", idleRoutes);
if (meetingRoutes) app.use("/api/meeting", meetingRoutes);
if (energyRoutes) app.use("/api/energy", energyRoutes);
if (analyticsRoutes) app.use("/api/analytics", analyticsRoutes);
if (velocityRoutes) app.use("/api", velocityRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FlowState Backend Running",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// API endpoints info
app.get("/api", (req, res) => {
  res.json({
    message: "FlowState API",
    endpoints: {
      auth: "/api/auth",
      tasks: "/api/tasks",
      activity: "/api/activity",
      session: "/api/session",
      idle: "/api/idle",
      meeting: "/api/meeting",
      energy: "/api/energy",
      analytics: "/api/analytics",
      velocity: "/api/velocity"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 Server started successfully!");
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/`);
  
  if (velocityRoutes) {
    console.log(`   Velocity: http://localhost:${PORT}/api/velocity/current`);
  }
  
  console.log("\n📝 Logs will appear below:\n");
});