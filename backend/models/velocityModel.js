/**
 * Velocity Model (MongoDB/Mongoose)
 * Stores velocity readings, error events, and activity tracking for persistent analytics
 * UPDATED: Added activity tracking schemas
 */

const mongoose = require('mongoose');

// ==========================================
// ACTIVITY EVENT SCHEMA (NEW)
// ==========================================
const activityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['click', 'keydown', 'mousemove', 'scroll', 'touchstart', 'idle', 'task_pause'],
    required: true
  },
  clicks: { type: Number, default: 0 },
  keystrokes: { type: Number, default: 0 },
  mouseMoves: { type: Number, default: 0 },
  scrolls: { type: Number, default: 0 },
  idleDuration: { type: Number, default: 0 }, // in milliseconds
  intensity: { type: Number, min: 0, max: 100 }, // activity intensity score
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

// ==========================================
// EXISTING SCHEMAS
// ==========================================

// Velocity Reading Schema
const velocityReadingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  velocity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  metrics: {
    completionTime: {
      type: Number,
      required: true
    },
    idleTime: {
      type: Number,
      required: true
    },
    totalTime: {
      type: Number,
      required: true
    },
    errorCount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Error Event Schema
const errorEventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  errorType: {
    type: String,
    required: true,
    enum: [
      'undo_redo',
      'validation_failure',
      'copy_paste_correction',
      'spell_check',
      'other'
    ]
  },
  errorData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Session Schema
const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalActivities: {
    type: Number,
    default: 0
  },
  totalErrors: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  averageVelocity: {
    type: Number
  },
  peakVelocity: {
    type: Number
  },
  lowestVelocity: {
    type: Number
  },
  interventionsTriggered: [{
    type: {
      type: String,
      enum: ['TAKE_BREAK', 'SWITCH_TASK']
    },
    timestamp: Date,
    data: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // NEW: Activity tracking metrics
  totalClicks: {
    type: Number,
    default: 0
  },
  totalKeystrokes: {
    type: Number,
    default: 0
  },
  totalIdleTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// ==========================================
// ACTIVITY DATA SCHEMA (NEW)
// ==========================================
const activityDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  activityEvents: [activityEventSchema],
  lastActivityTime: {
    type: Date,
    default: Date.now
  },
  sessionMetrics: {
    totalClicks: { type: Number, default: 0 },
    totalKeystrokes: { type: Number, default: 0 },
    totalMouseMoves: { type: Number, default: 0 },
    totalScrolls: { type: Number, default: 0 },
    totalIdleTime: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==========================================
// INDEXES
// ==========================================
velocityReadingSchema.index({ userId: 1, timestamp: -1 });
errorEventSchema.index({ userId: 1, timestamp: -1 });
sessionSchema.index({ userId: 1, isActive: 1 });
activityDataSchema.index({ userId: 1 });
activityDataSchema.index({ 'activityEvents.timestamp': -1 });

// ==========================================
// STATIC METHODS - VelocityReading
// ==========================================
velocityReadingSchema.statics.getBaselineVelocity = async function(userId, windowMinutes = 30) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        userId,
        timestamp: { $gte: windowStart }
      }
    },
    {
      $group: {
        _id: null,
        averageVelocity: { $avg: '$velocity' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].averageVelocity : null;
};

velocityReadingSchema.statics.getRecentReadings = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

velocityReadingSchema.statics.getVelocityHistory = async function(userId, hoursBack = 24) {
  const windowStart = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  
  return this.find({
    userId,
    timestamp: { $gte: windowStart }
  })
  .sort({ timestamp: 1 })
  .lean();
};

// ==========================================
// STATIC METHODS - ErrorEvent
// ==========================================
errorEventSchema.statics.getCurrentErrorRate = async function(userId, windowMinutes = 5) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const count = await this.countDocuments({
    userId,
    timestamp: { $gte: windowStart }
  });
  
  return count / windowMinutes;
};

errorEventSchema.statics.getAverageErrorRate = async function(userId, windowMinutes = 30) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const count = await this.countDocuments({
    userId,
    timestamp: { $gte: windowStart }
  });
  
  return count / windowMinutes;
};

errorEventSchema.statics.getErrorsByType = async function(userId, hoursBack = 24) {
  const windowStart = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId,
        timestamp: { $gte: windowStart }
      }
    },
    {
      $group: {
        _id: '$errorType',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// ==========================================
// STATIC METHODS - Session
// ==========================================
sessionSchema.statics.getActiveSession = async function(userId) {
  return this.findOne({ userId, isActive: true });
};

sessionSchema.statics.createSession = async function(userId) {
  // End any existing active sessions
  await this.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false, endTime: new Date() } }
  );
  
  // Create new session
  return this.create({ userId });
};

sessionSchema.statics.updateSessionStats = async function(userId, stats) {
  return this.findOneAndUpdate(
    { userId, isActive: true },
    { $set: stats, $inc: { totalActivities: 1 } },
    { new: true }
  );
};

sessionSchema.statics.endSession = async function(userId) {
  return this.findOneAndUpdate(
    { userId, isActive: true },
    { 
      $set: { 
        isActive: false, 
        endTime: new Date() 
      } 
    },
    { new: true }
  );
};

// ==========================================
// STATIC METHODS - ActivityData (NEW)
// ==========================================
activityDataSchema.statics.recordActivity = async function(userId, activityEvent) {
  return this.findOneAndUpdate(
    { userId },
    {
      $push: {
        activityEvents: {
          $each: [activityEvent],
          $slice: -1000 // Keep only last 1000 events
        }
      },
      $set: { 
        lastActivityTime: activityEvent.timestamp || Date.now(),
        updatedAt: Date.now()
      },
      $inc: {
        'sessionMetrics.totalClicks': activityEvent.clicks || 0,
        'sessionMetrics.totalKeystrokes': activityEvent.keystrokes || 0,
        'sessionMetrics.totalMouseMoves': activityEvent.mouseMoves || 0,
        'sessionMetrics.totalScrolls': activityEvent.scrolls || 0,
        'sessionMetrics.totalIdleTime': activityEvent.idleDuration || 0
      }
    },
    { upsert: true, new: true }
  );
};

activityDataSchema.statics.getRecentActivity = async function(userId, limit = 100) {
  const data = await this.findOne({ userId })
    .select('activityEvents')
    .lean();
  
  if (!data || !data.activityEvents) {
    return [];
  }
  
  return data.activityEvents
    .slice(-limit)
    .sort((a, b) => b.timestamp - a.timestamp);
};

activityDataSchema.statics.getActivityMetrics = async function(userId) {
  const data = await this.findOne({ userId })
    .select('sessionMetrics lastActivityTime')
    .lean();
  
  return data || {
    sessionMetrics: {
      totalClicks: 0,
      totalKeystrokes: 0,
      totalMouseMoves: 0,
      totalScrolls: 0,
      totalIdleTime: 0
    },
    lastActivityTime: null
  };
};

activityDataSchema.statics.resetSession = async function(userId) {
  return this.findOneAndUpdate(
    { userId },
    {
      $set: {
        'sessionMetrics.totalClicks': 0,
        'sessionMetrics.totalKeystrokes': 0,
        'sessionMetrics.totalMouseMoves': 0,
        'sessionMetrics.totalScrolls': 0,
        'sessionMetrics.totalIdleTime': 0,
        activityEvents: [],
        updatedAt: Date.now()
      }
    },
    { new: true }
  );
};

// ==========================================
// CREATE MODELS
// ==========================================
const VelocityReading = mongoose.model('VelocityReading', velocityReadingSchema);
const ErrorEvent = mongoose.model('ErrorEvent', errorEventSchema);
const Session = mongoose.model('Session', sessionSchema);
const ActivityData = mongoose.model('ActivityData', activityDataSchema); // NEW

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  VelocityReading,
  ErrorEvent,
  Session,
  ActivityData // NEW - Export the activity model
};