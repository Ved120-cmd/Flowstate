/**
 * Velocity Routes
 * API routes for velocity tracking and interventions
 */

const express = require('express');
const VelocityController = require('../controller/velocityController');

const router = express.Router();
const velocityController = new VelocityController();

// Activity tracking
router.post('/activity', velocityController.recordActivity);
router.post('/task/complete', velocityController.recordTaskCompletion);
router.post('/error', velocityController.recordError);

// Velocity endpoints
router.get('/velocity/current', velocityController.getCurrentVelocity);
router.get('/velocity/state', velocityController.getVelocityState);
router.post('/velocity/calculate', velocityController.calculateVelocity);

// Session management
router.post('/session/reset', velocityController.resetSession);
router.get('/idle/check', velocityController.checkIdle);

module.exports = router;