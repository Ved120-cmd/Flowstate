/**
 * Velocity Model (MongoDB/Mongoose)
 * Stores velocity readings and error events for persistent analytics
 */

const mongoose = require('mongoose');

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
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
velocityReadingSchema.index({ userId: 1, timestamp: -1 });
errorEventSchema.index({ userId: 1, timestamp: -1 });
sessionSchema.index({ userId: 1, isActive: 1 });

// Static methods for VelocityReading
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

// Static methods for ErrorEvent
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

// Static methods for Session
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

// Create models
const VelocityReading = mongoose.model('VelocityReading', velocityReadingSchema);
const ErrorEvent = mongoose.model('ErrorEvent', errorEventSchema);
const Session = mongoose.model('Session', sessionSchema);

module.exports = {
  VelocityReading,
  ErrorEvent,
  Session
};