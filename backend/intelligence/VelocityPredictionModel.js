/**
 * Velocity Prediction Model
 * Simple ML model for predicting user velocity based on activity
 */

class VelocityPredictionModel {
    constructor() {
      this.dataPoints = [];
      this.isInitialized = false;
      this.baselineVelocity = 100;
      this.peakHours = [];
    }
  
    /**
     * Train the model with new data
     */
    train(features, actualVelocity) {
      this.dataPoints.push({
        features,
        velocity: actualVelocity,
        timestamp: Date.now()
      });
  
      // Keep only last 100 data points
      if (this.dataPoints.length > 100) {
        this.dataPoints = this.dataPoints.slice(-100);
      }
  
      // Update baseline velocity (average of all velocities)
      const velocities = this.dataPoints.map(d => d.velocity);
      this.baselineVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  
      // Mark as initialized after 10 data points
      if (this.dataPoints.length >= 10) {
        this.isInitialized = true;
      }
  
      // Find peak hours
      this.updatePeakHours();
  
      console.log('🎓 Model trained. Data points:', this.dataPoints.length);
    }
  
    /**
     * Predict velocity based on features
     */
    predict(features) {
      if (!this.isInitialized || this.dataPoints.length < 10) {
        // Not enough data - calculate based on activity
        const activityIntensity = 
          (features.clicks || 0) + 
          (features.keystrokes || 0) * 2 + 
          (features.mouseMoves || 0) * 0.05 + 
          (features.scrolls || 0) * 1.5;
  
        let velocity = 100;
        
        // HIGH ACTIVITY = HIGH VELOCITY
        if (activityIntensity > 300) {
          velocity = 95 + Math.floor(Math.random() * 6);
        } else if (activityIntensity > 150) {
          velocity = 85 + Math.floor(Math.random() * 10);
        } else if (activityIntensity > 80) {
          velocity = 70 + Math.floor(Math.random() * 15);
        } else if (activityIntensity > 30) {
          velocity = 50 + Math.floor(Math.random() * 20);
        } else if (activityIntensity > 5) {
          velocity = 30 + Math.floor(Math.random() * 20);
        } else {
          velocity = 10 + Math.floor(Math.random() * 20);
        }
  
        return {
          velocity: Math.round(velocity),
          confidence: 0.3,
          suggestions: this.generateSuggestions(features, velocity)
        };
      }
  
      // ML prediction (when model is trained)
      const activityIntensity = 
        (features.clicks || 0) + 
        (features.keystrokes || 0) * 2 + 
        (features.mouseMoves || 0) * 0.05 + 
        (features.scrolls || 0) * 1.5;
  
      let predictedVelocity = this.baselineVelocity;
  
      // Adjust based on current activity vs baseline
      if (activityIntensity > 300) {
        predictedVelocity = Math.min(100, this.baselineVelocity + 15);
      } else if (activityIntensity > 150) {
        predictedVelocity = Math.min(100, this.baselineVelocity + 5);
      } else if (activityIntensity > 80) {
        predictedVelocity = this.baselineVelocity;
      } else if (activityIntensity > 30) {
        predictedVelocity = Math.max(40, this.baselineVelocity - 15);
      } else if (activityIntensity > 5) {
        predictedVelocity = Math.max(25, this.baselineVelocity - 25);
      } else {
        predictedVelocity = Math.max(10, this.baselineVelocity - 35);
      }
  
      // Generate suggestions
      const suggestions = this.generateSuggestions(features, predictedVelocity);
  
      return {
        velocity: Math.round(predictedVelocity),
        confidence: this.isInitialized ? 0.8 : 0.5,
        suggestions
      };
    }
  
    /**
     * Generate personalized suggestions
     */
    generateSuggestions(features, velocity) {
      const suggestions = [];
      const hour = features.hour || new Date().getHours();
      const activityIntensity = 
        (features.clicks || 0) + 
        (features.keystrokes || 0) * 2 + 
        (features.mouseMoves || 0) * 0.05 + 
        (features.scrolls || 0) * 1.5;
  
      console.log('🤔 Generating suggestions:', {
        velocity,
        hour,
        activityIntensity,
        isPeakHour: this.peakHours.includes(hour)
      });
  
      // 1. Low velocity/activity suggestion
      if (velocity < 60) {
        suggestions.push({
          type: 'TAKE_BREAK',
          priority: 'high',
          message: velocity < 40 
            ? 'Your energy is very low. Take a 10-minute break to recharge.'
            : 'Your focus seems to be drifting. A short break might help.',
          duration: velocity < 40 ? 10 : 5
        });
        console.log('✅ Added TAKE_BREAK suggestion (low velocity)');
      }
  
      // 2. Extended work session without break
      if (activityIntensity > 200 && this.dataPoints.length > 0) {
        const recentDataPoints = this.dataPoints.slice(-6);
        const allHighActivity = recentDataPoints.every(dp => {
          const intensity = (dp.features.clicks || 0) + (dp.features.keystrokes || 0) * 2;
          return intensity > 100;
        });
  
        if (allHighActivity && recentDataPoints.length >= 6) {
          suggestions.push({
            type: 'TAKE_BREAK',
            priority: 'high',
            message: 'You\'ve been working intensely for a while. Take a break to maintain productivity.',
            duration: 10
          });
          console.log('✅ Added TAKE_BREAK suggestion (extended work)');
        }
      }
  
      // 3. Peak hour suggestion
      if (this.peakHours.includes(hour) && velocity > 70) {
        suggestions.push({
          type: 'PEAK_HOUR',
          priority: 'medium',
          message: `You're in a peak productivity hour (${hour}:00)! Great time to tackle complex tasks.`,
        });
        console.log('✅ Added PEAK_HOUR suggestion');
      }
  
      // 4. Afternoon energy dip (2pm-4pm)
      if (hour >= 14 && hour <= 16) {
        if (velocity < 70) {
          suggestions.push({
            type: 'LOW_ENERGY_HOUR',
            priority: 'high',
            message: 'Afternoon energy dip detected. Try a quick walk, stretch, or healthy snack.',
            duration: 5
          });
          console.log('✅ Added LOW_ENERGY_HOUR suggestion');
        } else {
          suggestions.push({
            type: 'MAINTAIN_ENERGY',
            priority: 'low',
            message: 'You\'re doing well through the afternoon slump! Keep it up.',
          });
          console.log('✅ Added MAINTAIN_ENERGY suggestion');
        }
      }
  
      // 5. Late night work warning (after 9pm)
      if (hour >= 21 || hour <= 5) {
        suggestions.push({
          type: 'LATE_WORK',
          priority: 'medium',
          message: 'Working late? Remember to get adequate rest for tomorrow.',
        });
        console.log('✅ Added LATE_WORK suggestion');
      }
  
      // 6. Very low activity - idle too long
      if (activityIntensity < 10 && velocity < 50) {
        suggestions.push({
          type: 'IDLE_WARNING',
          priority: 'medium',
          message: 'You seem idle. If taking a break, great! If not, maybe time to re-engage.',
        });
        console.log('✅ Added IDLE_WARNING suggestion');
      }
  
      // 7. Morning motivation (6am-10am)
      if (hour >= 6 && hour <= 10 && velocity > 80) {
        suggestions.push({
          type: 'MORNING_BOOST',
          priority: 'low',
          message: 'Great morning energy! Excellent time for creative or challenging work.',
        });
        console.log('✅ Added MORNING_BOOST suggestion');
      }
  
      console.log(`📋 Total suggestions generated: ${suggestions.length}`);
      
      return suggestions;
    }
  
    /**
     * Update peak hours based on historical data
     */
    updatePeakHours() {
      if (this.dataPoints.length < 20) return;
  
      const hourlyVelocities = {};
      
      this.dataPoints.forEach(dp => {
        const hour = dp.features.hour;
        if (hour !== undefined) {
          if (!hourlyVelocities[hour]) {
            hourlyVelocities[hour] = [];
          }
          hourlyVelocities[hour].push(dp.velocity);
        }
      });
  
      // Find top 3 hours
      const avgByHour = Object.entries(hourlyVelocities).map(([hour, velocities]) => ({
        hour: parseInt(hour),
        avg: velocities.reduce((a, b) => a + b, 0) / velocities.length
      }));
  
      avgByHour.sort((a, b) => b.avg - a.avg);
      this.peakHours = avgByHour.slice(0, 3).map(h => h.hour);
    }
  
    /**
     * Get model statistics
     */
    getModelStats() {
      return {
        isInitialized: this.isInitialized,
        dataPointsCollected: this.dataPoints.length,
        userProfile: {
          baselineVelocity: Math.round(this.baselineVelocity),
          peakHours: this.peakHours
        },
        peakHours: this.peakHours,
        baselineVelocity: Math.round(this.baselineVelocity)
      };
    }
  }
  
  module.exports = VelocityPredictionModel;