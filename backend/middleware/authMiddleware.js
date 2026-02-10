// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 CRITICAL FIX - Your auth routes use req.userId, not req.user.id
    req.userId = decoded.userId || decoded.id || decoded._id;

    // Also set req.user for compatibility (some routes might use this)
    req.user = {
      id: req.userId,
      email: decoded.email,
    };

    if (!req.userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    next();
  } catch (err) {
    console.error("❌ AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};