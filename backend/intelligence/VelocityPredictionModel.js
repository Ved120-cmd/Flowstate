/**
 * Velocity Prediction Engine
 * Machine Learning model for predicting user productivity velocity
 * This is SEPARATE from the Mongoose VelocityModel schema
 */

class VelocityPredictionModel {
    constructor(options = {}) {
      this.learningRate = options.learningRate || 0.1;
      this.momentum = options.momentum || 0.9;
      this.decay = options.decay || 0.95;
      
      // Feature weights (online learning parameters)
      this.weights = {
        hour: 0,
        dayOfWeek: 0,
        clicks: 0,
        keystrokes: 0,
        mouseMoves: 0,
        scrolls: 0,
        taskComplexity: 0,
        recentCompletions: 0,
        avgTaskDuration: 0,
        bias: 5 // Starting bias at middle velocity
      };
      
      // Velocity gradient for momentum
      this.velocityGradients = {
        hour: 0,
        dayOfWeek: 0,
        clicks: 0,
        keystrokes: 0,
        mouseMoves: 0,
        scrolls: 0,
        taskComplexity: 0,
        recentCompletions: 0,
        avgTaskDuration: 0,
        bias: 0
      };
      
      // User profile statistics
      this.userProfile = {
        baselineVelocity: null,
        peakHours: [],
        lowEnergyHours: [],
        hourlyStats: {}, // hour -> {count, totalVelocity, avgVelocity}
        totalSamples: 0
      };
      
      // Model metadata
      this.dataPointsCollected = 0;
      this.isInitialized = false;
      this.lastTrainingTime = null;
    }
  
    /**
     * Normalize feature values to 0-1 range
     */
    normalizeFeatures(features) {
      return {
        hour: features.hour / 23, // 0-23 hours
        dayOfWeek: features.dayOfWeek / 6, // 0-6 days
        clicks: Math.min(features.clicks / 100, 1), // Cap at 100
        keystrokes: Math.min(features.keystrokes / 600, 1), // Cap at 600
        mouseMoves: Math.min(features.mouseMoves / 300, 1), // Cap at 300
        scrolls: Math.min(features.scrolls / 50, 1), // Cap at 50
        taskComplexity: features.taskComplexity / 5, // 1-5 scale
        recentCompletions: Math.min(features.recentCompletions / 5, 1), // Cap at 5
        avgTaskDuration: Math.min(features.avgTaskDuration / 60, 1) // Cap at 60 min
      };
    }
  
    /**
     * Make a velocity prediction
     */
    predict(features) {
      const normalized = this.normalizeFeatures(features);
      
      // Linear combination of features
      let prediction = this.weights.bias;
      
      for (const [key, value] of Object.entries(normalized)) {
        prediction += this.weights[key] * value;
      }
      
      // Clamp to 1-10 range
      prediction = Math.max(1, Math.min(10, Math.round(prediction)));
      
      // Determine confidence based on data collected
      let confidence = 'low';
      if (this.dataPointsCollected >= 50) {
        confidence = 'high';
      } else if (this.dataPointsCollected >= 20) {
        confidence = 'medium';
      }
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(features, prediction);
      
      return {
        velocity: prediction,
        confidence,
        suggestions,
        modelState: {
          dataPoints: this.dataPointsCollected,
          isInitialized: this.isInitialized
        }
      };
    }
  
    /**
     * Train the model with actual outcome (online learning)
     */
    train(features, actualVelocity) {
      const normalized = this.normalizeFeatures(features);
      
      // Current prediction
      let prediction = this.weights.bias;
      for (const [key, value] of Object.entries(normalized)) {
        prediction += this.weights[key] * value;
      }
      
      // Calculate error
      const error = actualVelocity - prediction;
      
      // Update weights with gradient descent + momentum
      for (const [key, value] of Object.entries(normalized)) {
        // Calculate gradient
        const gradient = error * value;
        
        // Apply momentum
        this.velocityGradients[key] = 
          this.momentum * this.velocityGradients[key] + 
          this.learningRate * gradient;
        
        // Update weight
        this.weights[key] += this.velocityGradients[key];
      }
      
      // Update bias
      const biasGradient = error;
      this.velocityGradients.bias = 
        this.momentum * this.velocityGradients.bias + 
        this.learningRate * biasGradient;
      this.weights.bias += this.velocityGradients.bias;
      
      // Apply weight decay to prevent overfitting
      for (const key in this.weights) {
        if (key !== 'bias') {
          this.weights[key] *= this.decay;
        }
      }
      
      // Update user profile statistics
      this.updateUserProfile(features, actualVelocity);
      
      // Update metadata
      this.dataPointsCollected++;
      this.isInitialized = true;
      this.lastTrainingTime = new Date();
      
      return {
        error,
        updatedWeights: { ...this.weights }
      };
    }
  
    /**
     * Update user profile with new data
     */
    updateUserProfile(features, velocity) {
      const hour = features.hour;
      
      // Initialize hour stats if needed
      if (!this.userProfile.hourlyStats[hour]) {
        this.userProfile.hourlyStats[hour] = {
          count: 0,
          totalVelocity: 0,
          avgVelocity: 0
        };
      }
      
      // Update hourly statistics
      const hourStats = this.userProfile.hourlyStats[hour];
      hourStats.count++;
      hourStats.totalVelocity += velocity;
      hourStats.avgVelocity = hourStats.totalVelocity / hourStats.count;
      
      // Update total samples
      this.userProfile.totalSamples++;
      
      // Calculate baseline velocity (overall average)
      let totalVelocity = 0;
      let totalCount = 0;
      for (const stats of Object.values(this.userProfile.hourlyStats)) {
        totalVelocity += stats.totalVelocity;
        totalCount += stats.count;
      }
      this.userProfile.baselineVelocity = totalCount > 0 
        ? Math.round((totalVelocity / totalCount) * 10) / 10 
        : null;
      
      // Identify peak hours (above baseline)
      if (this.userProfile.baselineVelocity && totalCount >= 10) {
        const peakThreshold = this.userProfile.baselineVelocity + 1;
        const lowThreshold = this.userProfile.baselineVelocity - 1;
        
        this.userProfile.peakHours = [];
        this.userProfile.lowEnergyHours = [];
        
        for (const [hour, stats] of Object.entries(this.userProfile.hourlyStats)) {
          if (stats.count >= 2) { // Need at least 2 samples
            if (stats.avgVelocity >= peakThreshold) {
              this.userProfile.peakHours.push(parseInt(hour));
            } else if (stats.avgVelocity <= lowThreshold) {
              this.userProfile.lowEnergyHours.push(parseInt(hour));
            }
          }
        }
        
        // Sort hours
        this.userProfile.peakHours.sort((a, b) => a - b);
        this.userProfile.lowEnergyHours.sort((a, b) => a - b);
      }
    }
  
    /**
     * Generate contextual suggestions
     */
    generateSuggestions(features, predictedVelocity) {
      const suggestions = [];
      const hour = features.hour;
      
      // Low velocity suggestions
      if (predictedVelocity <= 3) {
        suggestions.push({
          type: 'break_reminder',
          message: 'Your velocity is low. Consider taking a break or switching tasks.',
          action: 'take_break',
          priority: 'high'
        });
      }
      
      // Peak hour reminder
      if (this.userProfile.peakHours.includes(hour)) {
        suggestions.push({
          type: 'peak_hour',
          message: 'This is one of your peak productivity hours! Great time for complex tasks.',
          action: 'tackle_hard_tasks',
          priority: 'medium'
        });
      }
      
      // Low energy hour warning
      if (this.userProfile.lowEnergyHours.includes(hour)) {
        suggestions.push({
          type: 'low_energy_hour',
          message: 'This tends to be a low-energy hour for you. Consider lighter tasks.',
          action: 'do_simple_tasks',
          priority: 'medium'
        });
      }
      
      // High activity without breaks
      if (features.clicks > 80 || features.keystrokes > 500) {
        suggestions.push({
          type: 'activity_warning',
          message: "You've been very active. Remember to take regular breaks.",
          action: 'take_break',
          priority: 'medium'
        });
      }
      
      // High velocity - encourage continuation
      if (predictedVelocity >= 8) {
        suggestions.push({
          type: 'flow_state',
          message: "You're in a high-velocity flow state! Keep up the momentum.",
          action: 'continue_focus',
          priority: 'low'
        });
      }
      
      return suggestions;
    }
  
    /**
     * Get model statistics
     */
    getModelStats() {
      return {
        isInitialized: this.isInitialized,
        dataPointsCollected: this.dataPointsCollected,
        lastTrainingTime: this.lastTrainingTime,
        userProfile: {
          baselineVelocity: this.userProfile.baselineVelocity,
          peakHours: this.userProfile.peakHours,
          lowEnergyHours: this.userProfile.lowEnergyHours,
          totalSamples: this.userProfile.totalSamples
        },
        weights: { ...this.weights }
      };
    }
  
    /**
     * Export model state for persistence
     */
    exportState() {
      return {
        weights: this.weights,
        velocityGradients: this.velocityGradients,
        userProfile: this.userProfile,
        dataPointsCollected: this.dataPointsCollected,
        isInitialized: this.isInitialized,
        lastTrainingTime: this.lastTrainingTime,
        learningRate: this.learningRate,
        momentum: this.momentum,
        decay: this.decay
      };
    }
  
    /**
     * Import model state from persistence
     */
    importState(state) {
      this.weights = state.weights || this.weights;
      this.velocityGradients = state.velocityGradients || this.velocityGradients;
      this.userProfile = state.userProfile || this.userProfile;
      this.dataPointsCollected = state.dataPointsCollected || 0;
      this.isInitialized = state.isInitialized || false;
      this.lastTrainingTime = state.lastTrainingTime ? new Date(state.lastTrainingTime) : null;
      this.learningRate = state.learningRate || this.learningRate;
      this.momentum = state.momentum || this.momentum;
      this.decay = state.decay || this.decay;
    }
  }
  
  // CRITICAL: Proper CommonJS export
  module.exports = VelocityPredictionModel;