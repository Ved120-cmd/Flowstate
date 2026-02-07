/**
 * ML-Enhanced Velocity Controller
 * Uses online learning model for personalized recommendations
 */

const VelocityService = require('../services/velocityService');
const EngagementTracker = require('../middleware/engagementTracker');
const OnlineLearningModel = require('../services/onlineLearningModel');
const MLModel = require('../models/mlModelSchema');

class MLVelocityController {
  constructor() {
    this.velocityServices = new Map();
    this.engagementTracker = new EngagementTracker();
    this.mlModels = new Map(); // userId -> OnlineLearningModel
  }

  /**
   * Get or create ML model for user
   */
  async getMLModel(userId) {
    if (this.mlModels.has(userId)) {
      return this.mlModels.get(userId);
    }
    
    // Load from database if exists
    const savedModel = await MLModel.getOrCreateModel(userId);
    
    // Create OnlineLearningModel instance
    const mlModel = await OnlineLearningModel.loadModel(userId, savedModel);
    
    this.mlModels.set(userId, mlModel);
    return mlModel;
  }

  /**
   * Get velocity service (backwards compatibility)
   */
  getVelocityService(userId) {
    if (!this.velocityServices.has(userId)) {
      this.velocityServices.set(userId, new VelocityService());
    }
    return this.velocityServices.get(userId);
  }

  /**
   * POST /api/activity
   * Record user activity
   */
  recordActivity = async (req, res) => {
    try {
      const { userId, activityType, data } = req.body;
      
      if (!userId || !activityType) {
        return res.status(400).json({
          error: 'userId and activityType are required'
        });
      }
      
      const activity = this.engagementTracker.recordActivity(userId, activityType, data);
      
      res.json({
        success: true,
        activity
      });
    } catch (error) {
      console.error('Error recording activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/task/complete
   * Record task completion and train ML model
   */
  recordTaskCompletion = async (req, res) => {
    try {
      const { userId, taskId, duration, complexity } = req.body;
      
      if (!userId || !taskId || duration === undefined) {
        return res.status(400).json({
          error: 'userId, taskId, and duration are required'
        });
      }
      
      const result = this.engagementTracker.recordTaskCompletion(userId, {
        taskId,
        duration,
        complexity
      });
      
      // Get ML model and train with this data point
      const mlModel = await this.getMLModel(userId);
      const metrics = this.engagementTracker.getCurrentMetrics(userId);
      const velocity = mlModel.calculateVelocity(metrics);
      
      // Record data point for learning
      mlModel.recordDataPoint({
        timestamp: Date.now(),
        velocity,
        metrics,
        userState: {
          taskCompleted: true,
          complexity: complexity || 'medium'
        }
      });
      
      res.json({
        success: true,
        result,
        velocity,
        mlModelStatus: {
          isInitialized: mlModel.isInitialized,
          dataPointsCollected: mlModel.dataPointsCollected
        }
      });
    } catch (error) {
      console.error('Error recording task completion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/error
   * Record error event
   */
  recordError = async (req, res) => {
    try {
      const { userId, errorType, errorData } = req.body;
      
      if (!userId || !errorType) {
        return res.status(400).json({
          error: 'userId and errorType are required'
        });
      }
      
      const error = this.engagementTracker.recordError(userId, errorType, errorData);
      
      // Also record in velocity service
      const velocityService = this.getVelocityService(userId);
      velocityService.recordError(errorType);
      
      res.json({
        success: true,
        error
      });
    } catch (error) {
      console.error('Error recording error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/velocity/personalized
   * Get personalized velocity and recommendations using ML
   */
  getPersonalizedVelocity = async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }
      
      // Get current metrics
      const metrics = this.engagementTracker.getCurrentMetrics(userId);
      
      // Get ML model
      const mlModel = await this.getMLModel(userId);
      
      // Get current hour for temporal recommendations
      const currentHour = new Date().getHours();
      
      // Get personalized recommendations
      const recommendations = mlModel.getPersonalizedRecommendations(metrics, currentHour);
      
      // Save model state to database
      const modelState = await mlModel.saveModel();
      await MLModel.findOneAndUpdate(
        { userId },
        { $set: modelState },
        { upsert: true, new: true }
      );
      
      res.json({
        success: true,
        ...recommendations,
        metrics
      });
    } catch (error) {
      console.error('Error getting personalized velocity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/velocity/current
   * Get current velocity (original method - backwards compatible)
   */
  getCurrentVelocity = async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }
      
      const metrics = this.engagementTracker.getCurrentMetrics(userId);
      const velocityService = this.getVelocityService(userId);
      const result = velocityService.checkIntervention(metrics);
      
      res.json({
        success: true,
        ...result,
        metrics
      });
    } catch (error) {
      console.error('Error getting current velocity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/intervention/feedback
   * Record user's response to intervention (for learning)
   */
  recordInterventionFeedback = async (req, res) => {
    try {
      const { userId, interventionType, accepted, velocityBefore, velocityAfter } = req.body;
      
      if (!userId || !interventionType || accepted === undefined) {
        return res.status(400).json({
          error: 'userId, interventionType, and accepted are required'
        });
      }
      
      // Get ML model
      const mlModel = await this.getMLModel(userId);
      
      // Record feedback for learning
      const metrics = this.engagementTracker.getCurrentMetrics(userId);
      mlModel.recordDataPoint({
        timestamp: Date.now(),
        velocity: velocityBefore || 0,
        metrics,
        interventionTriggered: { type: interventionType },
        interventionAccepted: accepted,
        postInterventionVelocity: velocityAfter || null
      });
      
      // Save model
      const modelState = await mlModel.saveModel();
      await MLModel.findOneAndUpdate(
        { userId },
        { $set: modelState },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: 'Feedback recorded, model will adapt to your preferences',
        modelState: {
          dataPointsCollected: mlModel.dataPointsCollected,
          isInitialized: mlModel.isInitialized
        }
      });
    } catch (error) {
      console.error('Error recording intervention feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/ml/model/state
   * Get ML model state (for debugging/monitoring)
   */
  getModelState = async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }
      
      const mlModel = await this.getMLModel(userId);
      const state = mlModel.getModelState();
      
      res.json({
        success: true,
        modelState: state
      });
    } catch (error) {
      console.error('Error getting model state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/ml/model/reset
   * Reset ML model to default (start fresh learning)
   */
  resetModel = async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }
      
      // Delete from database
      await MLModel.deleteOne({ userId });
      
      // Remove from cache
      this.mlModels.delete(userId);
      
      res.json({
        success: true,
        message: 'ML model reset successfully. Will start fresh learning.'
      });
    } catch (error) {
      console.error('Error resetting model:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/velocity/state
   * Get velocity service state
   */
  getVelocityState = async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }
      
      const velocityService = this.getVelocityService(userId);
      const state = velocityService.getState();
      const sessionSummary = this.engagementTracker.getSessionSummary(userId);
      
      res.json({
        success: true,
        velocityState: state,
        sessionSummary
      });
    } catch (error) {
      console.error('Error getting velocity state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * POST /api/session/reset
   * Reset user session
   */
  resetSession = async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }
      
      this.engagementTracker.clearSession(userId);
      
      const velocityService = this.getVelocityService(userId);
      velocityService.reset();
      
      res.json({
        success: true,
        message: 'Session reset successfully'
      });
    } catch (error) {
      console.error('Error resetting session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * GET /api/idle/check
   * Check if user is idle
   */
  checkIdle = async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }
      
      const isIdle = this.engagementTracker.isUserIdle(userId);
      
      res.json({
        success: true,
        isIdle
      });
    } catch (error) {
      console.error('Error checking idle status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = MLVelocityController;