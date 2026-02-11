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
   Environment Check
======================= */
console.log("🔍 Environment Check:");
console.log("  - NODE_ENV:", process.env.NODE_ENV || "development");
console.log("  - PORT:", process.env.PORT || 5000);
console.log("  - MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Not set");
console.log("  - JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not set");

// Check required environment variables
if (!process.env.MONGO_URI) {
  console.error("\n❌ MONGO_URI is not defined in .env file");
  console.error("💡 Create a .env file in the backend directory with:");
  console.error("   MONGO_URI=mongodb://127.0.0.1:27017/flowstate");
  console.error("   JWT_SECRET=your-secret-key-here");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("\n❌ JWT_SECRET is not defined in .env file");
  console.error("💡 Add this to your .env file:");
  console.error("   JWT_SECRET=your-secret-key-here");
  process.exit(1);
}

/* =======================
   MongoDB Connection
======================= */
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

/* =======================
   Import Routes
======================= */
console.log('\n📦 Loading routes...\n');

let authRoutes, taskRoutes, activityRoutes, sessionRoutes;
let idleRoutes, meetingRoutes, energyRoutes, analyticsRoutes, mlVelocityRoutes;

try {
  authRoutes = require("./routes/auth");
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.error("❌ Error loading auth routes:", err.message);
  process.exit(1);
}

try {
  taskRoutes = require("./routes/tasks");
  console.log("✅ Task routes loaded");
} catch (err) {
  console.warn("⚠️  Task routes not found (optional)");
}

try {
  activityRoutes = require("./routes/activity");
  console.log("✅ Activity routes loaded");
} catch (err) {
  console.warn("⚠️  Activity routes not found (optional)");
}

try {
  sessionRoutes = require("./routes/session");
  console.log("✅ Session routes loaded");
} catch (err) {
  console.warn("⚠️  Session routes not found (optional)");
}

try {
  idleRoutes = require("./routes/idle");
  console.log("✅ Idle routes loaded");
} catch (err) {
  console.warn("⚠️  Idle routes not found (optional)");
}

try {
  meetingRoutes = require("./routes/meeting");
  console.log("✅ Meeting routes loaded");
} catch (err) {
  console.warn("⚠️  Meeting routes not found (optional)");
}

try {
  energyRoutes = require("./routes/energy");
  console.log("✅ Energy routes loaded");
} catch (err) {
  console.warn("⚠️  Energy routes not found (optional)");
}

try {
  analyticsRoutes = require("./routes/analytics");
  console.log("✅ Analytics routes loaded");
} catch (err) {
  console.warn("⚠️  Analytics routes not found (optional)");
}

// ✅ Load ML Velocity routes
try {
  mlVelocityRoutes = require("./routes/mlvelocity");
  console.log("🤖 ML Velocity routes loaded");
} catch (err) {
  console.error("❌ Error loading ML velocity routes:", err.message);
  console.error("   Stack:", err.stack);
}

console.log('\n📌 Registering routes...\n');

/* =======================
   Register Routes
======================= */
if (authRoutes) {
  app.use("/api/auth", authRoutes);
  console.log("✅ Mounted: /api/auth/*");
}

if (taskRoutes) {
  app.use("/api/tasks", taskRoutes);
  console.log("✅ Mounted: /api/tasks/*");
}

if (activityRoutes) {
  app.use("/api/activity", activityRoutes);
  console.log("✅ Mounted: /api/activity/* (legacy)");
}

if (sessionRoutes) {
  app.use("/api/session", sessionRoutes);
  console.log("✅ Mounted: /api/session/*");
}

if (idleRoutes) {
  app.use("/api/idle", idleRoutes);
  console.log("✅ Mounted: /api/idle/*");
}

if (meetingRoutes) {
  app.use("/api/meeting", meetingRoutes);
  console.log("✅ Mounted: /api/meeting/*");
}

if (energyRoutes) {
  app.use("/api/energy", energyRoutes);
  console.log("✅ Mounted: /api/energy/*");
}

if (analyticsRoutes) {
  app.use("/api/analytics", analyticsRoutes);
  console.log("✅ Mounted: /api/analytics/*");
}

// ✅ CRITICAL: Mount ML Velocity routes at /api
if (mlVelocityRoutes) {
  app.use("/api", mlVelocityRoutes);
  console.log("🤖 Mounted: /api/activity/* (ML-powered)");
  console.log("🤖 Mounted: /api/velocity/* (ML-powered)");
}

/* =======================
   Health Check Endpoints
======================= */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FlowState Backend Running 🚀",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "FlowState API",
    version: "1.0.0",
    ml_enabled: !!mlVelocityRoutes,
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

/* =======================
   Error Handling Middleware
======================= */
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/* =======================
   404 Handler
======================= */
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path,
    method: req.method,
    availableEndpoints: "/api"
  });
});

/* =======================
   Server Start
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 Server started successfully!");
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/`);
  
  if (mlVelocityRoutes) {
    console.log("\n🤖 ML-Powered Endpoints:");
    console.log(`   POST http://localhost:${PORT}/api/activity`);
    console.log(`   POST http://localhost:${PORT}/api/activity/task/start`);
    console.log(`   POST http://localhost:${PORT}/api/activity/task/complete`);
    console.log(`   GET  http://localhost:${PORT}/api/velocity/personalized`);
    console.log(`   POST http://localhost:${PORT}/api/velocity/feedback`);
  }
  
  console.log("\n📝 Logs will appear below:\n");
});