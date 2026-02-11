const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.userId = userId;
    req.user = {
      id: userId,
      email: decoded.email || null
    };

    next();
  } catch (err) {
    console.error("❌ AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};