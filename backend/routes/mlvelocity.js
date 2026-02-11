/**
 * ML-Enhanced Velocity Routes
 */

const express = require('express');
const router = express.Router();

// Import middleware
let authMiddleware;
try {
  authMiddleware = require('../middleware/authMiddleware');
  console.log('✅ Auth middleware loaded in mlvelocity.js');
} catch (err) {
  console.error('❌ Failed to load auth middleware:', err.message);
  // Create a dummy middleware that just passes through (for testing)
  authMiddleware = (req, res, next) => {
    req.user = { id: 'test-user' };
    next();
  };
}

// Import controller
let activityController;
try {
  activityController = require('../controller/activityController');
  console.log('✅ Activity controller loaded in mlvelocity.js');
  console.log('   Available methods:', Object.keys(activityController).join(', '));
} catch (err) {
  console.error('❌ Failed to load activity controller:', err.message);
  throw err; // Stop if controller can't be loaded
}

console.log('🤖 Registering ML Velocity routes...');

// Activity tracking endpoints
router.post('/activity', authMiddleware, (req, res, next) => {
  console.log('🎯 POST /api/activity endpoint hit!');
  activityController.recordActivity(req, res, next);
});

router.post('/activity/task/start', authMiddleware, (req, res, next) => {
  console.log('🎯 POST /api/activity/task/start endpoint hit!');
  activityController.recordTaskStart(req, res, next);
});

router.post('/activity/task/complete', authMiddleware, (req, res, next) => {
  console.log('🎯 POST /api/activity/task/complete endpoint hit!');
  activityController.recordTaskComplete(req, res, next);
});

// Velocity endpoints
router.get('/velocity/personalized', authMiddleware, (req, res, next) => {
  console.log('🎯 GET /api/velocity/personalized endpoint hit!');
  activityController.getPersonalizedVelocity(req, res, next);
});

router.post('/velocity/feedback', authMiddleware, (req, res, next) => {
  console.log('🎯 POST /api/velocity/feedback endpoint hit!');
  activityController.recordFeedback(req, res, next);
});

console.log('✅ ML Velocity routes registered successfully');
console.log('   POST /api/activity');
console.log('   POST /api/activity/task/start');
console.log('   POST /api/activity/task/complete');
console.log('   GET  /api/velocity/personalized');
console.log('   POST /api/velocity/feedback');

module.exports = router;