/**
 * Velocity Routes
 * Handles activity tracking and ML-based velocity predictions
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const activityController = require('../controller/activityController');

// Activity tracking endpoints
router.post('/activity', authMiddleware, activityController.recordActivity);
router.post('/activity/task/start', authMiddleware, activityController.recordTaskStart);
router.post('/activity/task/complete', authMiddleware, activityController.recordTaskComplete);

// Velocity endpoints
router.get('/velocity/personalized', authMiddleware, activityController.getPersonalizedVelocity);
router.post('/velocity/feedback', authMiddleware, activityController.recordFeedback);

console.log('✅ Velocity routes registered');

module.exports = router;