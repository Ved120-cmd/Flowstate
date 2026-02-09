/**
 * ML Velocity Controller
 * Orchestrates:
 *  - Activity ingestion
 *  - Online learning updates
 *  - Personalized velocity computation
 *  - Intelligence layer explanations
 */

const OnlineLearningModel = require("../services/onlineLearningModel");
const MLModel = require("../models/mlModelSchema");
const ActivityLog = require("../models/ActivityLog");
const WorkSession = require("../models/WorkSession");
const { runIntelligence } = require("../intelligence");

class MLVelocityController {
  constructor() {
    this.modelCache = new Map(); // in-memory cache per user
  }

  /* ----------------------- MODEL LOADING ----------------------- */

  async getUserModel(userId) {
    if (this.modelCache.has(userId)) {
      return this.modelCache.get(userId);
    }

    const persistedModel = await MLModel.getOrCreateModel(userId);
    const model = await OnlineLearningModel.loadModel(userId, persistedModel);

    this.modelCache.set(userId, model);
    return model;
  }

  async persistModel(userId, model) {
    const savedState = await model.saveModel();

    await MLModel.findOneAndUpdate(
      { userId },
      { ...savedState, isInitialized: model.isInitialized },
      { upsert: true }
    );
  }

  /* ----------------------- ACTIVITY INGESTION ----------------------- */

  recordActivity = async (req, res) => {
    try {
      const { userId, metrics } = req.body;
      const model = await this.getUserModel(userId);

      const velocity = model.calculateVelocity(metrics);

      await ActivityLog.create({
        userId,
        type: "ACTIVITY",
        metadata: { metrics, velocity }
      });

      model.recordDataPoint({
        timestamp: Date.now(),
        velocity,
        metrics,
        userState: {},
        interventionTriggered: null
      });

      await this.persistModel(userId, model);

      res.json({ success: true, velocity });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to record activity" });
    }
  };

  recordTaskCompletion = async (req, res) => {
    try {
      const { userId, metrics } = req.body;
      const model = await this.getUserModel(userId);

      const velocity = model.calculateVelocity(metrics);

      model.recordDataPoint({
        timestamp: Date.now(),
        velocity,
        metrics,
        userState: { taskCompleted: true },
        interventionTriggered: null
      });

      await this.persistModel(userId, model);

      res.json({ success: true, velocity });
    } catch (err) {
      res.status(500).json({ error: "Failed to record task completion" });
    }
  };

  recordError = async (req, res) => {
    try {
      const { userId, errorType } = req.body;

      await ActivityLog.create({
        userId,
        type: "ERROR",
        metadata: { errorType }
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to record error" });
    }
  };

  /* ----------------------- VELOCITY ----------------------- */

  getCurrentVelocity = async (req, res) => {
    try {
      const { userId, metrics } = req.query;
      const model = await this.getUserModel(userId);

      const velocity = model.calculateVelocity(metrics);
      res.json({ velocity });
    } catch (err) {
      res.status(500).json({ error: "Failed to compute velocity" });
    }
  };

  getVelocityState = async (req, res) => {
    try {
      const { userId } = req.query;
      const model = await this.getUserModel(userId);
      res.json(model.getModelState());
    } catch (err) {
      res.status(500).json({ error: "Failed to get velocity state" });
    }
  };

  /* ----------------------- PERSONALIZED + INTELLIGENCE ----------------------- */

  getPersonalizedVelocity = async (req, res) => {
    try {
      const userId = req.user.id;
      const { metrics } = req.body;

      const model = await this.getUserModel(userId);
      const hour = new Date().getHours();

      const mlOutput = model.getPersonalizedRecommendations(metrics, hour);

      const intelligence = runIntelligence({
        mlOutput,
        workdayPreference: req.user.workdayGoal || "BALANCED"
      });

      res.json({
        ml: mlOutput,
        intelligence
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate intelligence" });
    }
  };

  /* ----------------------- INTERVENTION FEEDBACK ----------------------- */

  recordInterventionFeedback = async (req, res) => {
    try {
      const { userId, interventionType, accepted, postVelocity, metrics } = req.body;
      const model = await this.getUserModel(userId);

      model.recordDataPoint({
        timestamp: Date.now(),
        velocity: model.calculateVelocity(metrics),
        metrics,
        interventionTriggered: { type: interventionType },
        interventionAccepted: accepted,
        postInterventionVelocity: postVelocity
      });

      await this.persistModel(userId, model);

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to record feedback" });
    }
  };

  /* ----------------------- MODEL MANAGEMENT ----------------------- */

  getModelState = async (req, res) => {
    try {
      const { userId } = req.query;
      const model = await this.getUserModel(userId);
      res.json(model.getModelState());
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch model state" });
    }
  };

  resetModel = async (req, res) => {
    try {
      const { userId } = req.body;

      await MLModel.deleteOne({ userId });
      this.modelCache.delete(userId);

      res.json({ success: true, message: "Model reset" });
    } catch (err) {
      res.status(500).json({ error: "Failed to reset model" });
    }
  };

  /* ----------------------- SESSION / IDLE ----------------------- */

  resetSession = async (req, res) => {
    try {
      const { userId } = req.body;
      await WorkSession.deleteMany({ userId });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to reset session" });
    }
  };

  checkIdle = async (req, res) => {
    try {
      const { userId } = req.query;

      const lastActivity = await ActivityLog.findOne({ userId })
        .sort({ createdAt: -1 });

      const idleMinutes = lastActivity
        ? (Date.now() - new Date(lastActivity.createdAt)) / 60000
        : null;

      res.json({
        idle: idleMinutes !== null && idleMinutes > 5,
        idleMinutes
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to check idle state" });
    }
  };
}

module.exports = MLVelocityController;
