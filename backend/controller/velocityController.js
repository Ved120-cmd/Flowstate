/**
 * Velocity Controller (non-ML)
 * Velocity tracking and interventions using VelocityService + EngagementTracker
 */

const VelocityService = require('../services/velocityService');
const EngagementTracker = require('../middleware/engagementTracker');

class VelocityController {
  constructor() {
    this.velocityServices = new Map();
    this.engagementTracker = new EngagementTracker();
  }

  getVelocityService(userId) {
    if (!this.velocityServices.has(userId)) {
      this.velocityServices.set(userId, new VelocityService());
    }
    return this.velocityServices.get(userId);
  }

  /**
   * POST /api/activity
   */
  recordActivity = async (req, res) => {
    try {
      const { userId, activityType, data } = req.body;
      if (!userId || !activityType) {
        return res.status(400).json({ error: 'userId and activityType are required' });
      }
      const activity = this.engagementTracker.recordActivity(userId, activityType, data);
      res.json({ success: true, activity });
    } catch (error) {
      console.error('Error recording activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/task/complete
   */
  recordTaskCompletion = async (req, res) => {
    try {
      const { userId, taskId, duration, complexity } = req.body;
      if (!userId || !taskId || duration === undefined) {
        return res.status(400).json({ error: 'userId, taskId, and duration are required' });
      }
      const result = this.engagementTracker.recordTaskCompletion(userId, {
        taskId,
        duration,
        complexity
      });
      const metrics = this.engagementTracker.getCurrentMetrics(userId);
      const velocityService = this.getVelocityService(userId);
      const velocity = velocityService.calculateVelocity(metrics);
      velocityService.recordVelocity(velocity);
      res.json({ success: true, result, velocity });
    } catch (error) {
      console.error('Error recording task completion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/error
   */
  recordError = async (req, res) => {
    try {
      const { userId, errorType, errorData } = req.body;
      if (!userId || !errorType) {
        return res.status(400).json({ error: 'userId and errorType are required' });
      }
      const error = this.engagementTracker.recordError(userId, errorType, errorData);
      const velocityService = this.getVelocityService(userId);
      velocityService.recordError(errorType);
      res.json({ success: true, error });
    } catch (error) {
      console.error('Error recording error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/velocity/current
   */
  getCurrentVelocity = async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const metrics = this.engagementTracker.getCurrentMetrics(userId);
      const velocityService = this.getVelocityService(userId);
      const result = velocityService.checkIntervention(metrics);
      res.json({ success: true, ...result, metrics });
    } catch (error) {
      console.error('Error getting current velocity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/velocity/state
   */
  getVelocityState = async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const velocityService = this.getVelocityService(userId);
      const velocityState = velocityService.getState();
      const sessionSummary = this.engagementTracker.getSessionSummary(userId);
      res.json({ success: true, velocityState, sessionSummary });
    } catch (error) {
      console.error('Error getting velocity state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/velocity/calculate
   * Body: either { userId } or { completionTime, idleTime, totalTime, errorCount }
   */
  calculateVelocity = async (req, res) => {
    try {
      const { userId, completionTime, idleTime, totalTime, errorCount } = req.body;
      let metrics;

      if (userId) {
        metrics = this.engagementTracker.getCurrentMetrics(userId);
      } else if (
        completionTime !== undefined &&
        idleTime !== undefined &&
        totalTime !== undefined &&
        errorCount !== undefined
      ) {
        metrics = {
          completionTime: Number(completionTime) || 1,
          idleTime: Number(idleTime) || 0,
          totalTime: Number(totalTime) || 1,
          errorCount: Number(errorCount) || 0
        };
      } else {
        return res.status(400).json({
          error: 'Provide either userId or (completionTime, idleTime, totalTime, errorCount)'
        });
      }

      const velocityService = userId ? this.getVelocityService(userId) : new VelocityService();
      const velocity = velocityService.calculateVelocity(metrics);
      res.json({ success: true, velocity, metrics });
    } catch (error) {
      console.error('Error calculating velocity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/session/reset
   */
  resetSession = async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      this.engagementTracker.clearSession(userId);
      const velocityService = this.getVelocityService(userId);
      velocityService.reset();
      res.json({ success: true, message: 'Session reset successfully' });
    } catch (error) {
      console.error('Error resetting session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/idle/check
   */
  checkIdle = async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const isIdle = this.engagementTracker.isUserIdle(userId);
      res.json({ success: true, isIdle });
    } catch (error) {
      console.error('Error checking idle status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = VelocityController;
