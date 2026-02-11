/**
 * Activity Controller - FIXED VERSION
 * Handles activity recording and ML model updates
 */

const ActivityLog = require('../models/ActivityLog');
// Use the ML prediction model, NOT the Mongoose schema
const VelocityModel = require('../intelligence/VelocityPredictionModel');

// Singleton velocity model instance
let velocityModel = null;

/**
 * Get or create velocity model instance
 */
function getVelocityModel() {
  if (!velocityModel) {
    velocityModel = new VelocityModel();
  }
  return velocityModel;
}

/**
 * Record user activity and update ML model
 * POST /api/activity
 */
/**
 * Record user activity and update ML model
 * POST /api/activity
 */
exports.recordActivity = async (req, res) => {
  try {
    const {
      activityType,
      clicks = 0,
      keystrokes = 0,
      mouseMoves = 0,
      scrolls = 0,
      idleDuration = 0,
      taskId = null,
      timestamp = Date.now()
    } = req.body;

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    console.log('📊 Recording activity:', {
      userId: userId.toString(),
      activityType,
      clicks,
      keystrokes,
      mouseMoves,
      scrolls
    });

    // Save activity log
    const activityLog = new ActivityLog({
      userId,
      activityType,
      clicks,
      keystrokes,
      mouseMoves,
      scrolls,
      idleDuration,
      taskId,
      timestamp: new Date(timestamp)
    });

    await activityLog.save();

    // ✅ Calculate velocity based on activity intensity
    const activityIntensity = clicks + (keystrokes * 2) + (mouseMoves * 0.05) + (scrolls * 1.5);
    
    // ✅ High activity = high velocity (90-100%)
    // ✅ Medium activity = medium velocity (70-89%)
    // ✅ Low activity = low velocity (50-69%)
    // ✅ Idle = very low velocity (0-49%)
    
    let velocity = 100; // Default to 100%
    
    if (activityIntensity > 300) {
      velocity = 95 + Math.floor(Math.random() * 6); // 95-100%
    } else if (activityIntensity > 150) {
      velocity = 80 + Math.floor(Math.random() * 15); // 80-94%
    } else if (activityIntensity > 50) {
      velocity = 60 + Math.floor(Math.random() * 20); // 60-79%
    } else if (activityIntensity > 10) {
      velocity = 40 + Math.floor(Math.random() * 20); // 40-59%
    } else {
      velocity = 10 + Math.floor(Math.random() * 30); // 10-39%
    }

    // Get velocity model for ML predictions
    const model = getVelocityModel();
    const now = new Date(timestamp);
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Get recent task statistics
    const recentTasks = await ActivityLog.find({
      userId,
      activityType: 'task_complete',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(10);

    const recentCompletions = recentTasks.length;
    const avgTaskDuration = recentTasks.length > 0
      ? recentTasks.reduce((sum, task) => sum + (task.duration || 30), 0) / recentTasks.length
      : 30;

    // Estimate task complexity based on activity intensity
    let taskComplexity = 1;
    if (activityIntensity > 500) taskComplexity = 5;
    else if (activityIntensity > 350) taskComplexity = 4;
    else if (activityIntensity > 200) taskComplexity = 3;
    else if (activityIntensity > 100) taskComplexity = 2;

    const features = {
      hour,
      dayOfWeek,
      clicks,
      keystrokes,
      mouseMoves,
      scrolls,
      taskComplexity,
      recentCompletions,
      avgTaskDuration
    };

    // Get ML prediction
    const prediction = model.predict(features);
    
    // ✅ Use ML prediction if model is trained, otherwise use activity-based velocity
    const finalVelocity = model.getModelStats().isInitialized 
      ? prediction.velocity 
      : velocity;

    console.log('🎯 Velocity calculated:', {
      activityIntensity,
      activityBasedVelocity: velocity,
      mlPrediction: prediction.velocity,
      finalVelocity
    });

    // Get model statistics
    const modelStats = model.getModelStats();

    res.status(200).json({
      success: true,
      message: 'Activity recorded successfully',
      velocity: finalVelocity,
      confidence: prediction.confidence,
      suggestions: prediction.suggestions,
      mlModelStatus: {
        ...modelStats,
        baselineVelocity: finalVelocity // ✅ Update baseline
      },
      activityLog: {
        id: activityLog._id,
        activityType: activityLog.activityType,
        timestamp: activityLog.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Error recording activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record activity',
      error: error.message
    });
  }
};

/**
 * Record task completion (this trains the model!)
 * POST /api/activity/task/complete
 */
exports.recordTaskComplete = async (req, res) => {
  try {
    const { taskId, duration, complexity = 3 } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    console.log('✅ Recording task completion:', { taskId, duration, complexity });

    // Save completion activity
    const activityLog = new ActivityLog({
      userId,
      activityType: 'task_complete',
      taskId,
      taskComplexity: complexity,
      duration,
      timestamp: new Date()
    });

    await activityLog.save();

    // Get model
    const model = getVelocityModel();
    const now = new Date();

    // Get recent activity metrics
    const recentActivity = await ActivityLog.findOne({
      userId,
      activityType: { $in: ['activity', 'active'] },
      timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
    }).sort({ timestamp: -1 });

    const features = {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      clicks: recentActivity?.clicks || 50,
      keystrokes: recentActivity?.keystrokes || 300,
      mouseMoves: recentActivity?.mouseMoves || 180,
      scrolls: recentActivity?.scrolls || 25,
      taskComplexity: complexity,
      recentCompletions: 1,
      avgTaskDuration: duration
    };

    // Calculate actual velocity based on performance
    // Lower duration = higher velocity
    const actualVelocity = Math.max(1, Math.min(10, Math.round(
      10 - (duration / 10) + (complexity / 2)
    )));

    console.log('🎓 Training model - Expected velocity:', actualVelocity);

    // TRAIN THE MODEL with actual outcome
    model.train(features, actualVelocity);

    // Get updated prediction
    const prediction = model.predict(features);
    const modelStats = model.getModelStats();

    console.log('📊 Model stats after training:', {
      dataPoints: modelStats.dataPointsCollected,
      baseline: modelStats.userProfile.baselineVelocity
    });

    res.status(200).json({
      success: true,
      message: 'Task completed and model updated',
      velocity: prediction.velocity,
      confidence: prediction.confidence,
      suggestions: prediction.suggestions,
      mlModelStatus: modelStats,
      taskCompletion: {
        taskId,
        duration,
        complexity,
        actualVelocity
      }
    });

  } catch (error) {
    console.error('❌ Error completing task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete task',
      error: error.message
    });
  }
};

/**
 * Get personalized velocity
 * GET /api/velocity/personalized
 */
/**
 * Get personalized velocity
 * GET /api/velocity/personalized
 */
/**
 * Get personalized velocity
 * GET /api/velocity/personalized
 */
exports.getPersonalizedVelocity = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const model = getVelocityModel();
    const now = new Date();

    // Get recent activity
    const recentActivity = await ActivityLog.findOne({
      userId,
      timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    }).sort({ timestamp: -1 });

    // Get recent task completions
    const recentTasks = await ActivityLog.find({
      userId,
      activityType: 'task_complete',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(5);

    const features = {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      clicks: recentActivity?.clicks || 0,
      keystrokes: recentActivity?.keystrokes || 0,
      mouseMoves: recentActivity?.mouseMoves || 0,
      scrolls: recentActivity?.scrolls || 0,
      taskComplexity: 3,
      recentCompletions: recentTasks.length,
      avgTaskDuration: recentTasks.length > 0
        ? recentTasks.reduce((sum, t) => sum + (t.duration || 30), 0) / recentTasks.length
        : 30
    };

    const prediction = model.predict(features);
    const modelStats = model.getModelStats();

    // ✅ If no recent activity, return 100% velocity
    const velocity = recentActivity ? prediction.velocity : 100;

    res.status(200).json({
      success: true,
      velocity: velocity,
      confidence: prediction.confidence,
      suggestions: prediction.suggestions,
      mlModelStatus: {
        ...modelStats,
        baselineVelocity: velocity // ✅ Set baseline to current velocity
      },
      currentContext: {
        hour: features.hour,
        dayOfWeek: features.dayOfWeek,
        recentCompletions: features.recentCompletions
      }
    });

  } catch (error) {
    console.error('❌ Error getting velocity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get velocity',
      error: error.message
    });
  }
};

/**
 * Record intervention feedback
 * POST /api/velocity/feedback
 */
exports.recordFeedback = async (req, res) => {
  try {
    const { suggestionType, accepted } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const activityLog = new ActivityLog({
      userId,
      activityType: 'feedback',
      metadata: { suggestionType, accepted },
      timestamp: new Date()
    });

    await activityLog.save();

    res.status(200).json({
      success: true,
      message: 'Feedback recorded'
    });

  } catch (error) {
    console.error('❌ Error recording feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
};