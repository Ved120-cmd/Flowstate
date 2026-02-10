/**
 * ML Model Schema (MongoDB/Mongoose)
 * Stores the online learning model state for persistence
 */

const mongoose = require('mongoose');

const mlModelSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Personalized weights (learned through gradient descent)
  personalizedWeights: {
    alpha: {
      type: Number,
      default: 0.4
    },
    beta: {
      type: Number,
      default: 0.35
    },
    gamma: {
      type: Number,
      default: 0.25
    }
  },
  
  // Adaptive thresholds (personalized for each user)
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
    velocityTrend: {
      type: [
        {
          timestamp: Date,
          velocity: Number
        }
      ],
      default: []
    },
    errorPatterns: {
      type: Map,
      of: Number,
      default: {}
    },
    interventionSuccess: {
      type: Map,
      of: {
        accepted: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        effectiveness: { type: Number, default: 0 }
      },
      default: {
        'TAKE_BREAK': { accepted: 0, rejected: 0, effectiveness: 0 },
        'SWITCH_TASK': { accepted: 0, rejected: 0, effectiveness: 0 }
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
  dataPointsCollected: {
    type: Number,
    default: 0
  },
  
  isInitialized: {
    type: Boolean,
    default: false
  },
  
  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
mlModelSchema.index({ userId: 1 });
mlModelSchema.index({ lastUpdate: -1 });

// Static methods

/**
 * Get or create ML model for user
 */
mlModelSchema.statics.getOrCreateModel = async function(userId) {
  let model = await this.findOne({ userId });
  
  if (!model) {
    model = await this.create({
      userId,
      personalizedWeights: {
        alpha: 0.4,
        beta: 0.35,
        gamma: 0.25
      },
      personalizedThresholds: {
        velocityDropThreshold: 0.70,
        errorRateMultiplier: 2.0,
        consecutiveDropsRequired: 2,
        breakDurationMinutes: 5,
        optimalVelocityRange: [60, 85]
      },
      userProfile: {
        peakHours: [],
        lowEnergyHours: [],
        averageTaskDuration: 15,
        preferredComplexity: 'medium',
        breakFrequency: 90,
        baselineVelocity: null,
        velocityTrend: [],
        errorPatterns: {},
        interventionSuccess: {
          'TAKE_BREAK': { accepted: 0, rejected: 0, effectiveness: 0 },
          'SWITCH_TASK': { accepted: 0, rejected: 0, effectiveness: 0 }
        },
        totalSessions: 0,
        totalWorkTime: 0,
        averageSessionLength: 0
      },
      dataPointsCollected: 0,
      isInitialized: false,
      lastUpdate: Date.now()
    });
  }
  
  return model;
};

/**
 * Update model state
 */
mlModelSchema.statics.updateModel = async function(userId, modelState) {
  return this.findOneAndUpdate(
    { userId },
    { 
      $set: {
        ...modelState,
        lastUpdate: Date.now()
      }
    },
    { upsert: true, new: true }
  );
};

/**
 * Get model statistics
 */
mlModelSchema.statics.getModelStats = async function(userId) {
  const model = await this.findOne({ userId });
  
  if (!model) {
    return null;
  }
  
  return {
    userId: model.userId,
    isInitialized: model.isInitialized,
    dataPointsCollected: model.dataPointsCollected,
    lastUpdate: model.lastUpdate,
    baselineVelocity: model.userProfile.baselineVelocity,
    peakHours: model.userProfile.peakHours,
    lowEnergyHours: model.userProfile.lowEnergyHours,
    optimalRange: model.personalizedThresholds.optimalVelocityRange
  };
};

/**
 * Reset model to defaults
 */
mlModelSchema.methods.resetToDefaults = async function() {
  this.personalizedWeights = {
    alpha: 0.4,
    beta: 0.35,
    gamma: 0.25
  };
  
  this.personalizedThresholds = {
    velocityDropThreshold: 0.70,
    errorRateMultiplier: 2.0,
    consecutiveDropsRequired: 2,
    breakDurationMinutes: 5,
    optimalVelocityRange: [60, 85]
  };
  
  this.userProfile = {
    peakHours: [],
    lowEnergyHours: [],
    averageTaskDuration: 15,
    preferredComplexity: 'medium',
    breakFrequency: 90,
    baselineVelocity: null,
    velocityTrend: [],
    errorPatterns: {},
    interventionSuccess: {
      'TAKE_BREAK': { accepted: 0, rejected: 0, effectiveness: 0 },
      'SWITCH_TASK': { accepted: 0, rejected: 0, effectiveness: 0 }
    },
    totalSessions: 0,
    totalWorkTime: 0,
    averageSessionLength: 0
  };
  
  this.dataPointsCollected = 0;
  this.isInitialized = false;
  this.lastUpdate = Date.now();
  
  return this.save();
};

const MLModel = mongoose.model('MLModel', mlModelSchema);

module.exports = MLModel;