/**
 * ML Model Schema for MongoDB
 * Stores user-specific ML models for personalized velocity tracking
 */

const mongoose = require('mongoose');

const mlModelSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Personalized weights
  personalizedWeights: {
    alpha: {
      type: Number,
      default: 0.4,
      min: 0,
      max: 1
    },
    beta: {
      type: Number,
      default: 0.35,
      min: 0,
      max: 1
    },
    gamma: {
      type: Number,
      default: 0.25,
      min: 0,
      max: 1
    }
  },
  
  // Personalized thresholds
  personalizedThresholds: {
    velocityDropThreshold: {
      type: Number,
      default: 0.70
    },
    errorRateMultiplier: {
      type: Number,
      default: 2.0
    },
    consecutiveDropsRequired: {
      type: Number,
      default: 2
    },
    breakDurationMinutes: {
      type: Number,
      default: 5
    },
    optimalVelocityRange: {
      type: [Number],
      default: [60, 85]
    }
  },
  
  // User behavior profile
  userProfile: {
    peakHours: {
      type: [Number],
      default: []
    },
    lowEnergyHours: {
      type: [Number],
      default: []
    },
    averageTaskDuration: {
      type: Number,
      default: 15
    },
    preferredComplexity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    breakFrequency: {
      type: Number,
      default: 90
    },
    baselineVelocity: {
      type: Number,
      default: null
    },
    velocityTrend: [{
      timestamp: Date,
      velocity: Number
    }],
    errorPatterns: {
      type: Map,
      of: Number,
      default: {}
    },
    interventionSuccess: {
      TAKE_BREAK: {
        accepted: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        effectiveness: { type: Number, default: 0 }
      },
      SWITCH_TASK: {
        accepted: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        effectiveness: { type: Number, default: 0 }
      }
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    totalWorkTime: {
      type: Number,
      default: 0
    },
    averageSessionLength: {
      type: Number,
      default: 0
    }
  },
  
  // Model metadata
  isInitialized: {
    type: Boolean,
    default: false
  },
  dataPointsCollected: {
    type: Number,
    default: 0
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get or create model for user
mlModelSchema.statics.getOrCreateModel = async function(userId) {
  let model = await this.findOne({ userId });
  
  if (!model) {
    model = await this.create({ userId });
  }
  
  return model;
};

// Instance method to update with new data point
mlModelSchema.methods.recordDataPoint = function(dataPoint) {
  this.dataPointsCollected++;
  
  // Update velocity trend (keep last 100)
  this.userProfile.velocityTrend.push({
    timestamp: dataPoint.timestamp,
    velocity: dataPoint.velocity
  });
  
  if (this.userProfile.velocityTrend.length > 100) {
    this.userProfile.velocityTrend.shift();
  }
  
  // Update baseline velocity (moving average)
  if (this.userProfile.baselineVelocity === null) {
    this.userProfile.baselineVelocity = dataPoint.velocity;
  } else {
    this.userProfile.baselineVelocity = 
      0.95 * this.userProfile.baselineVelocity + 0.05 * dataPoint.velocity;
  }
  
  this.lastUpdate = Date.now();
  
  return this.save();
};

const MLModel = mongoose.model('MLModel', mlModelSchema);

module.exports = MLModel;