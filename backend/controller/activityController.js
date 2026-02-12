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

    // ✅ Calculate activity intensity
    const activityIntensity = clicks + (keystrokes * 2) + (mouseMoves * 0.05) + (scrolls * 1.5);
    
    console.log('🔥 Activity intensity:', activityIntensity);
    
    // ✅ HIGH ACTIVITY = HIGH VELOCITY (stays near 100%)
    // ✅ LOW ACTIVITY = VELOCITY DECREASES
    // ✅ IDLE = VELOCITY DROPS SIGNIFICANTLY
    
    let velocity = 100; // Start at maximum
    
    if (activityIntensity > 300) {
      // Very high activity - maintain peak velocity
      velocity = 95 + Math.floor(Math.random() * 6); // 95-100%
      console.log('⚡ Very high activity detected');
    } else if (activityIntensity > 150) {
      // High activity - good velocity
      velocity = 85 + Math.floor(Math.random() * 10); // 85-94%
      console.log('🔥 High activity detected');
    } else if (activityIntensity > 80) {
      // Medium activity - decent velocity
      velocity = 70 + Math.floor(Math.random() * 15); // 70-84%
      console.log('💪 Medium activity detected');
    } else if (activityIntensity > 30) {
      // Low activity - velocity dropping
      velocity = 50 + Math.floor(Math.random() * 20); // 50-69%
      console.log('📉 Low activity detected');
    } else if (activityIntensity > 5) {
      // Very low activity - significant drop
      velocity = 30 + Math.floor(Math.random() * 20); // 30-49%
      console.log('⚠️ Very low activity detected');
    } else {
      // Idle/no activity - velocity drops to minimum
      velocity = 10 + Math.floor(Math.random() * 20); // 10-29%
      console.log('😴 Idle detected');
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
    
    // ✅ Use activity-based velocity initially, then ML when trained
    const finalVelocity = model.getModelStats().isInitialized && model.getModelStats().dataPointsCollected > 20
      ? prediction.velocity 
      : velocity;

    console.log('🎯 Velocity calculated:', {
      activityIntensity,
      activityBasedVelocity: velocity,
      mlPrediction: prediction.velocity,
      finalVelocity,
      mlInitialized: model.getModelStats().isInitialized
    });

    // ✅ FORCE SUGGESTIONS FOR TESTING (generates suggestions based on current state)
    if (!prediction.suggestions || prediction.suggestions.length === 0) {
      const testSuggestions = [];
      
      // Low velocity suggestion
      if (finalVelocity < 60) {
        testSuggestions.push({
          type: 'TAKE_BREAK',
          priority: 'high',
          message: finalVelocity < 40 
            ? 'Your energy is very low. Take a 10-minute break to recharge.'
            : 'Your focus seems to be drifting. A short break might help.',
          duration: finalVelocity < 40 ? 10 : 5
        });
        console.log('✅ Added TAKE_BREAK suggestion (low velocity)');
      }
      
      // High activity suggestion
      if (activityIntensity > 200) {
        testSuggestions.push({
          type: 'PEAK_HOUR',
          priority: 'medium',
          message: 'High activity detected! You\'re in the zone.',
        });
        console.log('✅ Added PEAK_HOUR suggestion (high activity)');
      }
      
      // Afternoon dip suggestion (2pm-4pm)
      if (hour >= 14 && hour <= 16) {
        testSuggestions.push({
          type: 'LOW_ENERGY_HOUR',
          priority: 'medium',
          message: 'Afternoon energy dip time. A quick walk or snack might help.',
          duration: 5
        });
        console.log('✅ Added LOW_ENERGY_HOUR suggestion (afternoon)');
      }
      
      // Late night warning
      if (hour >= 21 || hour <= 5) {
        testSuggestions.push({
          type: 'LATE_WORK',
          priority: 'medium',
          message: 'Working late? Remember to get adequate rest for tomorrow.',
        });
        console.log('✅ Added LATE_WORK suggestion');
      }
      
      // Morning motivation
      if (hour >= 6 && hour <= 10 && finalVelocity > 80) {
        testSuggestions.push({
          type: 'MORNING_BOOST',
          priority: 'low',
          message: 'Great morning energy! This is an excellent time for challenging work.',
        });
        console.log('✅ Added MORNING_BOOST suggestion');
      }
      
      // Idle warning
      if (activityIntensity < 10 && finalVelocity < 50) {
        testSuggestions.push({
          type: 'IDLE_WARNING',
          priority: 'medium',
          message: 'You seem idle. If you\'re taking a break, great! If not, maybe time to re-engage.',
        });
        console.log('✅ Added IDLE_WARNING suggestion');
      }
      
      if (testSuggestions.length > 0) {
        prediction.suggestions = testSuggestions;
        console.log(`🧪 Generated ${testSuggestions.length} suggestions`);
      }
    }

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
        baselineVelocity: finalVelocity
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
 * Record task start
 * POST /api/activity/task/start
 */
exports.recordTaskStart = async (req, res) => {
  try {
    const { taskId, complexity = 3 } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const activityLog = new ActivityLog({
      userId,
      activityType: 'task_start',
      taskId,
      taskComplexity: complexity,
      timestamp: new Date()
    });

    await activityLog.save();

    // Get current velocity prediction
    const model = getVelocityModel();
    const now = new Date();
    
    const features = {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      clicks: 0,
      keystrokes: 0,
      mouseMoves: 0,
      scrolls: 0,
      taskComplexity: complexity,
      recentCompletions: 0,
      avgTaskDuration: 30
    };

    const prediction = model.predict(features);

    res.status(200).json({
      success: true,
      message: 'Task started',
      velocity: prediction.velocity,
      taskId,
      startTime: activityLog.timestamp
    });

  } catch (error) {
    console.error('❌ Error starting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start task',
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
      timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
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

    // If no recent activity, return 100% velocity
    const velocity = recentActivity ? prediction.velocity : 100;

    res.status(200).json({
      success: true,
      velocity: velocity,
      confidence: prediction.confidence,
      suggestions: prediction.suggestions,
      mlModelStatus: {
        ...modelStats,
        baselineVelocity: velocity
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