/**
 * Online Learning Model for Personalized Velocity Tracking
 * Uses incremental learning to adapt to individual user patterns
 */

class OnlineLearningModel {
  constructor(userId) {
    this.userId = userId;
    
    // User-specific learned parameters (start neutral)
    this.personalizedWeights = {
      alpha: 0.4,   // Completion time weight
      beta: 0.35,   // Idle time weight
      gamma: 0.25   // Error rate weight
    };
    
    // Adaptive thresholds (start with defaults, then personalize)
    this.personalizedThresholds = {
      velocityDropThreshold: 0.70,      // 70% of baseline
      errorRateMultiplier: 2.0,         // 2x average
      consecutiveDropsRequired: 2,      // 2 consecutive drops
      breakDurationMinutes: 5,          // Suggested break duration
      optimalVelocityRange: [60, 85]   // User's optimal range
    };
    
    // Learning rate (how fast the model adapts)
    this.learningRate = 0.1;
    
    // User behavior patterns
    this.userProfile = {
      // Temporal patterns
      peakHours: [],                    // Hours when user is most productive
      lowEnergyHours: [],               // Hours when user struggles
      
      // Work patterns
      averageTaskDuration: 15,          // Minutes per task
      preferredComplexity: 'medium',    // Preferred task complexity
      breakFrequency: 90,               // Minutes between breaks
      
      // Performance patterns
      baselineVelocity: null,           // User's normal velocity
      velocityTrend: [],                // Historical velocity trend
      errorPatterns: {},                // Common error types
      
      // Intervention effectiveness
      interventionSuccess: {
        'TAKE_BREAK': { accepted: 0, rejected: 0, effectiveness: 0 },
        'SWITCH_TASK': { accepted: 0, rejected: 0, effectiveness: 0 }
      },
      
      // Session statistics
      totalSessions: 0,
      totalWorkTime: 0,
      averageSessionLength: 0
    };
    
    // Training data buffer (for batch updates)
    this.trainingBuffer = [];
    this.bufferSize = 50;  // Update model every 50 data points
    
    // Model state
    this.isInitialized = false;
    this.dataPointsCollected = 0;
    this.lastUpdate = Date.now();
  }

  /**
   * Record a data point for learning
   */
  recordDataPoint(dataPoint) {
    const {
      timestamp,
      velocity,
      metrics,
      userState,
      interventionTriggered,
      interventionAccepted,
      postInterventionVelocity
    } = dataPoint;
    
    this.trainingBuffer.push(dataPoint);
    this.dataPointsCollected++;
    
    // Update user profile in real-time
    this.updateUserProfile(dataPoint);
    
    // Perform incremental learning if buffer is full
    if (this.trainingBuffer.length >= this.bufferSize) {
      this.performIncrementalLearning();
    }
  }

  /**
   * Update user profile with new data
   */
  updateUserProfile(dataPoint) {
    const hour = new Date(dataPoint.timestamp).getHours();
    
    // Track velocity trend
    this.userProfile.velocityTrend.push({
      timestamp: dataPoint.timestamp,
      velocity: dataPoint.velocity
    });
    
    // Keep only last 100 data points
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
    
    // Track peak hours (high velocity hours)
    if (dataPoint.velocity > (this.userProfile.baselineVelocity * 1.1)) {
      if (!this.userProfile.peakHours.includes(hour)) {
        this.userProfile.peakHours.push(hour);
      }
    }
    
    // Track low energy hours
    if (dataPoint.velocity < (this.userProfile.baselineVelocity * 0.8)) {
      if (!this.userProfile.lowEnergyHours.includes(hour)) {
        this.userProfile.lowEnergyHours.push(hour);
      }
    }
    
    // Track intervention effectiveness
    if (dataPoint.interventionTriggered) {
      const type = dataPoint.interventionTriggered.type;
      
      if (dataPoint.interventionAccepted) {
        this.userProfile.interventionSuccess[type].accepted++;
        
        // Calculate effectiveness (velocity improvement after intervention)
        if (dataPoint.postInterventionVelocity) {
          const improvement = dataPoint.postInterventionVelocity - dataPoint.velocity;
          this.userProfile.interventionSuccess[type].effectiveness = 
            (this.userProfile.interventionSuccess[type].effectiveness + improvement) / 2;
        }
      } else {
        this.userProfile.interventionSuccess[type].rejected++;
      }
    }
  }

  /**
   * Perform incremental learning on buffered data
   */
  performIncrementalLearning() {
    console.log(`🧠 Learning from ${this.trainingBuffer.length} new data points...`);
    
    // 1. Update personalized weights using gradient descent
    this.updateWeights();
    
    // 2. Adapt thresholds based on user response patterns
    this.adaptThresholds();
    
    // 3. Update optimal velocity range
    this.updateOptimalRange();
    
    // Clear buffer
    this.trainingBuffer = [];
    this.isInitialized = true;
    this.lastUpdate = Date.now();
    
    console.log('✅ Model updated with personalized parameters');
  }

  /**
   * Update weights using online gradient descent
   */
  updateWeights() {
    // Calculate error gradient for each weight
    let alphaGradient = 0;
    let betaGradient = 0;
    let gammaGradient = 0;
    
    this.trainingBuffer.forEach(dataPoint => {
      const { velocity, metrics } = dataPoint;
      const predicted = this.calculateVelocity(metrics);
      const error = velocity - predicted;
      
      // Gradient calculations (partial derivatives)
      alphaGradient += error * (1 / metrics.completionTime);
      betaGradient += error * (1 - (metrics.idleTime / metrics.totalTime));
      gammaGradient += error * (metrics.errorCount / metrics.totalTime);
    });
    
    // Average gradients
    const n = this.trainingBuffer.length;
    alphaGradient /= n;
    betaGradient /= n;
    gammaGradient /= n;
    
    // Update weights
    this.personalizedWeights.alpha += this.learningRate * alphaGradient;
    this.personalizedWeights.beta += this.learningRate * betaGradient;
    this.personalizedWeights.gamma += this.learningRate * gammaGradient;
    
    // Normalize weights to sum to 1
    const sum = this.personalizedWeights.alpha + 
                this.personalizedWeights.beta + 
                this.personalizedWeights.gamma;
    
    this.personalizedWeights.alpha /= sum;
    this.personalizedWeights.beta /= sum;
    this.personalizedWeights.gamma /= sum;
  }

  /**
   * Adapt thresholds based on intervention success
   */
  adaptThresholds() {
    // Calculate acceptance rate for each intervention type
    const breakStats = this.userProfile.interventionSuccess['TAKE_BREAK'];
    const switchStats = this.userProfile.interventionSuccess['SWITCH_TASK'];
    
    const breakAcceptanceRate = breakStats.accepted / 
      (breakStats.accepted + breakStats.rejected + 1);
    
    const switchAcceptanceRate = switchStats.accepted / 
      (switchStats.accepted + switchStats.rejected + 1);
    
    // Adjust velocity drop threshold
    // If user rejects breaks often, make threshold stricter (lower)
    if (breakAcceptanceRate < 0.3) {
      this.personalizedThresholds.velocityDropThreshold -= 0.05;
      this.personalizedThresholds.velocityDropThreshold = 
        Math.max(0.5, this.personalizedThresholds.velocityDropThreshold);
    } else if (breakAcceptanceRate > 0.7) {
      // If user accepts breaks often, can be more sensitive (higher)
      this.personalizedThresholds.velocityDropThreshold += 0.05;
      this.personalizedThresholds.velocityDropThreshold = 
        Math.min(0.85, this.personalizedThresholds.velocityDropThreshold);
    }
    
    // Adjust error rate multiplier based on switch task acceptance
    if (switchAcceptanceRate < 0.3) {
      this.personalizedThresholds.errorRateMultiplier += 0.2;
      this.personalizedThresholds.errorRateMultiplier = 
        Math.min(3.0, this.personalizedThresholds.errorRateMultiplier);
    } else if (switchAcceptanceRate > 0.7) {
      this.personalizedThresholds.errorRateMultiplier -= 0.2;
      this.personalizedThresholds.errorRateMultiplier = 
        Math.max(1.5, this.personalizedThresholds.errorRateMultiplier);
    }
  }

  /**
   * Update optimal velocity range based on user's historical performance
   */
  updateOptimalRange() {
    const velocities = this.userProfile.velocityTrend.map(v => v.velocity);
    
    if (velocities.length < 10) return;
    
    // Calculate percentiles (25th and 75th)
    const sorted = [...velocities].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    this.personalizedThresholds.optimalVelocityRange = [
      sorted[q1Index],
      sorted[q3Index]
    ];
  }

  /**
   * Calculate velocity using personalized weights
   */
  calculateVelocity(metrics) {
    const { completionTime, idleTime, totalTime, errorCount } = metrics;
    
    if (completionTime === 0 || totalTime === 0) {
      return 0;
    }
    
    const completionScore = 1 / completionTime;
    const idleRatio = idleTime / totalTime;
    const errorRate = errorCount / totalTime;
    
    // Use personalized weights
    const rawVelocity = 
      this.personalizedWeights.alpha * completionScore + 
      this.personalizedWeights.beta * (1 - idleRatio) - 
      this.personalizedWeights.gamma * errorRate;
    
    const normalizedVelocity = Math.max(0, Math.min(100, rawVelocity * 100));
    
    return normalizedVelocity;
  }

  /**
   * Predict if user should take a break (personalized)
   */
  shouldSuggestBreak(currentVelocity, currentHour) {
    // Check if in low energy hours
    const isLowEnergyHour = this.userProfile.lowEnergyHours.includes(currentHour);
    
    // Use personalized threshold
    const threshold = this.userProfile.baselineVelocity * 
                     this.personalizedThresholds.velocityDropThreshold;
    
    // Be more proactive during low energy hours
    const adjustedThreshold = isLowEnergyHour ? threshold * 1.1 : threshold;
    
    return currentVelocity < adjustedThreshold;
  }

  /**
   * Predict optimal break duration for user
   */
  predictOptimalBreakDuration(currentVelocity) {
    const velocityDeficit = this.userProfile.baselineVelocity - currentVelocity;
    
    // More velocity drop = longer break needed
    if (velocityDeficit > 20) {
      return 10; // 10 minute break
    } else if (velocityDeficit > 10) {
      return 7;  // 7 minute break
    } else {
      return 5;  // 5 minute break
    }
  }

  /**
   * Get personalized recommendations
   */
  getPersonalizedRecommendations(currentMetrics, currentHour) {
    const velocity = this.calculateVelocity(currentMetrics);
    
    const recommendations = {
      currentVelocity: velocity,
      personalizedWeights: this.personalizedWeights,
      personalizedThresholds: this.personalizedThresholds,
      userProfile: {
        peakHours: this.userProfile.peakHours,
        lowEnergyHours: this.userProfile.lowEnergyHours,
        baselineVelocity: this.userProfile.baselineVelocity,
        optimalRange: this.personalizedThresholds.optimalVelocityRange
      },
      suggestions: []
    };
    
    // Check if should suggest break
    if (this.shouldSuggestBreak(velocity, currentHour)) {
      const breakDuration = this.predictOptimalBreakDuration(velocity);
      recommendations.suggestions.push({
        type: 'TAKE_BREAK',
        priority: 'high',
        message: `Take a ${breakDuration}-minute break. Your velocity is below your personal baseline.`,
        duration: breakDuration,
        reason: 'personalized_threshold'
      });
    }
    
    // Check if currently in low energy hour
    if (this.userProfile.lowEnergyHours.includes(currentHour)) {
      recommendations.suggestions.push({
        type: 'LOW_ENERGY_HOUR',
        priority: 'medium',
        message: 'This is typically a low-energy hour for you. Consider tackling easier tasks.',
        reason: 'historical_pattern'
      });
    }
    
    // Check if currently in peak hour
    if (this.userProfile.peakHours.includes(currentHour)) {
      recommendations.suggestions.push({
        type: 'PEAK_HOUR',
        priority: 'medium',
        message: 'This is one of your peak productivity hours. Great time for challenging tasks!',
        reason: 'historical_pattern'
      });
    }
    
    return recommendations;
  }

  /**
   * Get model state (for debugging/monitoring)
   */
  getModelState() {
    return {
      userId: this.userId,
      isInitialized: this.isInitialized,
      dataPointsCollected: this.dataPointsCollected,
      lastUpdate: new Date(this.lastUpdate).toISOString(),
      personalizedWeights: this.personalizedWeights,
      personalizedThresholds: this.personalizedThresholds,
      userProfile: this.userProfile,
      trainingBufferSize: this.trainingBuffer.length
    };
  }

  /**
   * Save model to database (to be implemented)
   */
  async saveModel() {
    // This would save the model state to database
    // For now, return the serializable state
    return {
      userId: this.userId,
      personalizedWeights: this.personalizedWeights,
      personalizedThresholds: this.personalizedThresholds,
      userProfile: this.userProfile,
      dataPointsCollected: this.dataPointsCollected,
      lastUpdate: this.lastUpdate
    };
  }

  /**
   * Load model from database (Mongoose doc or plain object)
   */
  static async loadModel(userId, savedState) {
    const model = new OnlineLearningModel(userId);
    
    if (savedState) {
      // Handle Mongoose document: use plain object to avoid mutating doc
      const state = savedState.toObject ? savedState.toObject() : savedState;
      model.personalizedWeights = state.personalizedWeights || model.personalizedWeights;
      model.personalizedThresholds = state.personalizedThresholds || model.personalizedThresholds;
      model.userProfile = state.userProfile
        ? JSON.parse(JSON.stringify({ ...model.userProfile, ...state.userProfile }))
        : model.userProfile;
      model.dataPointsCollected = state.dataPointsCollected ?? model.dataPointsCollected;
      model.lastUpdate = state.lastUpdate ?? model.lastUpdate;
      model.isInitialized = !!state.isInitialized;
    }
    
    return model;
  }
}

module.exports = OnlineLearningModel;