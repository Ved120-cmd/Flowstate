/**
 * ML-Enhanced Velocity Routes
 * API routes with machine learning personalization
 */

const express = require('express');
const MLVelocityController = require('../controller/mlVelocityController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const mlVelocityController = new MLVelocityController();

// Activity tracking
router.post('/activity', mlVelocityController.recordActivity);
router.post('/task/complete', mlVelocityController.recordTaskCompletion);
router.post('/error', mlVelocityController.recordError);

// Velocity endpoints
router.get('/velocity/current', mlVelocityController.getCurrentVelocity);
router.get('/velocity/state', mlVelocityController.getVelocityState);

// ML-powered personalized suggestions (uses JWT userId)
router.get('/velocity/personalized', authMiddleware, mlVelocityController.getPersonalizedVelocity);
router.post('/intervention/feedback', mlVelocityController.recordInterventionFeedback);

// ML model management
router.get('/ml/model/state', mlVelocityController.getModelState);
router.post('/ml/model/reset', mlVelocityController.resetModel);

// Session management
router.post('/session/reset', mlVelocityController.resetSession);
router.get('/idle/check', mlVelocityController.checkIdle);

module.exports = router;