/**
 * Velocity Service
 * Implements the Work Velocity formula and drop detection logic
 */

class VelocityService {
  constructor() {
    // Weights for velocity calculation (tunable)
    this.ALPHA = 0.4;  // Weight for completion speed
    this.BETA = 0.35;   // Weight for idle time
    this.GAMMA = 0.25;  // Weight for error rate
    
    // Thresholds
    this.VELOCITY_DROP_THRESHOLD = 0.70; // 70% of baseline
    this.ERROR_RATE_MULTIPLIER = 2.0;    // 2x recent average
    this.CONSECUTIVE_WINDOWS_REQUIRED = 2; // Need 2 consecutive drops
    
    // Window sizes (in minutes)
    this.UPDATE_WINDOW = 1;        // Update every 1 minute
    this.BASELINE_WINDOW = 30;     // 30-minute baseline
    this.ERROR_WINDOW = 5;         // 5-minute error tracking
    
    // Data stores (in production, use a database)
    this.velocityHistory = [];
    this.errorHistory = [];
    this.consecutiveDrops = 0;
  }

  /**
   * Calculate Work Velocity using the formula:
   * Velocity = α * (1/CompletionTime) + β * (1 - IdleRatio) - γ * ErrorRate
   * 
   * @param {Object} metrics - Current work metrics
   * @param {number} metrics.completionTime - Time taken to complete tasks (in minutes)
   * @param {number} metrics.idleTime - Time spent idle (in minutes)
   * @param {number} metrics.totalTime - Total time in the window (in minutes)
   * @param {number} metrics.errorCount - Number of errors in the window
   * @returns {number} Velocity score (normalized 0-100)
   */
  calculateVelocity(metrics) {
    const { completionTime, idleTime, totalTime, errorCount } = metrics;
    
    // Avoid division by zero
    if (completionTime === 0 || totalTime === 0) {
      return 0;
    }
    
    // Calculate components
    const completionScore = 1 / completionTime;
    const idleRatio = idleTime / totalTime;
    const errorRate = errorCount / totalTime;
    
    // Apply formula
    const rawVelocity = 
      this.ALPHA * completionScore + 
      this.BETA * (1 - idleRatio) - 
      this.GAMMA * errorRate;
    
    // Normalize to 0-100 scale (adjust multiplier based on your needs)
    const normalizedVelocity = Math.max(0, Math.min(100, rawVelocity * 100));
    
    return normalizedVelocity;
  }

  /**
   * Add velocity measurement to history
   */
  recordVelocity(velocity, timestamp = Date.now()) {
    this.velocityHistory.push({
      velocity,
      timestamp
    });
    
    // Keep only last 60 minutes of data
    const cutoffTime = timestamp - (60 * 60 * 1000);
    this.velocityHistory = this.velocityHistory.filter(
      record => record.timestamp > cutoffTime
    );
  }

  /**
   * Record error event
   */
  recordError(errorType, timestamp = Date.now()) {
    this.errorHistory.push({
      errorType,
      timestamp
    });
    
    // Keep only last 30 minutes of error data
    const cutoffTime = timestamp - (30 * 60 * 1000);
    this.errorHistory = this.errorHistory.filter(
      record => record.timestamp > cutoffTime
    );
  }

  /**
   * Calculate baseline velocity (average over baseline window)
   */
  getBaselineVelocity(timestamp = Date.now()) {
    const windowStart = timestamp - (this.BASELINE_WINDOW * 60 * 1000);
    const recentVelocities = this.velocityHistory.filter(
      record => record.timestamp >= windowStart
    );
    
    if (recentVelocities.length === 0) {
      return null; // Not enough data
    }
    
    const sum = recentVelocities.reduce((acc, record) => acc + record.velocity, 0);
    return sum / recentVelocities.length;
  }

  /**
   * Calculate current error rate (errors per minute in last error window)
   */
  getCurrentErrorRate(timestamp = Date.now()) {
    const windowStart = timestamp - (this.ERROR_WINDOW * 60 * 1000);
    const recentErrors = this.errorHistory.filter(
      record => record.timestamp >= windowStart
    );
    
    return recentErrors.length / this.ERROR_WINDOW;
  }

  /**
   * Calculate average error rate (for comparison)
   */
  getAverageErrorRate(timestamp = Date.now()) {
    const windowStart = timestamp - (this.BASELINE_WINDOW * 60 * 1000);
    const recentErrors = this.errorHistory.filter(
      record => record.timestamp >= windowStart
    );
    
    if (recentErrors.length === 0) {
      return 0;
    }
    
    return recentErrors.length / this.BASELINE_WINDOW;
  }

  /**
   * Check if velocity has dropped below threshold
   * @returns {Object} Drop detection result
   */
  checkVelocityDrop(currentVelocity) {
    const baseline = this.getBaselineVelocity();
    
    if (baseline === null) {
      return {
        shouldIntervene: false,
        reason: 'insufficient_data'
      };
    }
    
    const threshold = baseline * this.VELOCITY_DROP_THRESHOLD;
    const hasDropped = currentVelocity < threshold;
    
    if (hasDropped) {
      this.consecutiveDrops++;
    } else {
      this.consecutiveDrops = 0;
    }
    
    const shouldIntervene = this.consecutiveDrops >= this.CONSECUTIVE_WINDOWS_REQUIRED;
    
    return {
      shouldIntervene,
      reason: 'velocity_drop',
      currentVelocity,
      baseline,
      threshold,
      consecutiveDrops: this.consecutiveDrops,
      dropPercentage: ((baseline - currentVelocity) / baseline * 100).toFixed(1)
    };
  }

  /**
   * Check if error rate has climbed above threshold
   * @returns {Object} Error rate check result
   */
  checkErrorRate() {
    const currentRate = this.getCurrentErrorRate();
    const averageRate = this.getAverageErrorRate();
    
    if (averageRate === 0) {
      return {
        shouldIntervene: false,
        reason: 'insufficient_data'
      };
    }
    
    const threshold = averageRate * this.ERROR_RATE_MULTIPLIER;
    const shouldIntervene = currentRate > threshold;
    
    return {
      shouldIntervene,
      reason: 'high_error_rate',
      currentRate,
      averageRate,
      threshold,
      rateIncrease: ((currentRate / averageRate)).toFixed(2) + 'x'
    };
  }

  /**
   * Main intervention check - combines both velocity and error checks
   * @param {Object} metrics - Current work metrics
   * @returns {Object} Intervention recommendation
   */
  checkIntervention(metrics) {
    // Calculate current velocity
    const currentVelocity = this.calculateVelocity(metrics);
    this.recordVelocity(currentVelocity);
    
    // Check for velocity drop
    const velocityCheck = this.checkVelocityDrop(currentVelocity);
    
    // Check for high error rate
    const errorCheck = this.checkErrorRate();
    
    // Determine intervention type
    let intervention = null;
    
    if (errorCheck.shouldIntervene) {
      intervention = {
        type: 'SWITCH_TASK',
        priority: 'high',
        message: 'Your error rate is high. Switch to a Low-complexity task from your queue.',
        data: errorCheck
      };
    } else if (velocityCheck.shouldIntervene) {
      intervention = {
        type: 'TAKE_BREAK',
        priority: 'medium',
        message: 'Your work velocity has dropped. Take a 5-minute movement break.',
        data: velocityCheck
      };
    }
    
    return {
      currentVelocity,
      intervention,
      velocityCheck,
      errorCheck
    };
  }

  /**
   * Get current state summary
   */
  getState() {
    const currentErrorRate = this.getCurrentErrorRate();
    const averageErrorRate = this.getAverageErrorRate();
    const baseline = this.getBaselineVelocity();
    
    return {
      velocityHistory: this.velocityHistory.slice(-10), // Last 10 readings
      errorHistory: this.errorHistory.slice(-20), // Last 20 errors
      currentErrorRate,
      averageErrorRate,
      baseline,
      consecutiveDrops: this.consecutiveDrops
    };
  }

  /**
   * Reset tracking (useful for new sessions)
   */
  reset() {
    this.velocityHistory = [];
    this.errorHistory = [];
    this.consecutiveDrops = 0;
  }
}

module.exports = VelocityService;