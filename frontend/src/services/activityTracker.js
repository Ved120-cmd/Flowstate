// frontend/src/services/activityTracker.js
/**
 * Activity Tracker Service
 * Monitors user interactions (clicks, keyboard, mouse movement, scrolling)
 * Detects idle states and sends activity data to ML model
 */

class ActivityTracker {
    constructor(options = {}) {
      this.idleThreshold = options.idleThreshold || 120000; // 2 minutes default
      this.activityCheckInterval = options.activityCheckInterval || 10000; // Check every 10 seconds
      this.onActivity = options.onActivity || (() => {});
      this.onIdle = options.onIdle || (() => {});
      this.onActive = options.onActive || (() => {});
      
      // State
      this.lastActivityTime = Date.now();
      this.isIdle = false;
      this.activityCount = {
        clicks: 0,
        keystrokes: 0,
        mouseMoves: 0,
        scrolls: 0
      };
      this.sessionStart = Date.now();
      this.checkInterval = null;
      this.isTracking = false;
      
      // Bind methods
      this.handleActivity = this.handleActivity.bind(this);
      this.checkIdleState = this.checkIdleState.bind(this);
    }
  
    /**
     * Start tracking user activity
     */
    start() {
      if (this.isTracking) return;
      
      console.log('🎯 Activity tracking started');
      this.isTracking = true;
      this.lastActivityTime = Date.now();
      this.sessionStart = Date.now();
      
      // Listen to user events
      window.addEventListener('click', this.handleActivity);
      window.addEventListener('keydown', this.handleActivity);
      window.addEventListener('mousemove', this.handleActivity);
      window.addEventListener('scroll', this.handleActivity);
      window.addEventListener('touchstart', this.handleActivity);
      
      // Start idle check interval
      this.checkInterval = setInterval(this.checkIdleState, this.activityCheckInterval);
    }
  
    /**
     * Stop tracking
     */
    stop() {
      if (!this.isTracking) return;
      
      console.log('⏸️  Activity tracking stopped');
      this.isTracking = false;
      
      // Remove event listeners
      window.removeEventListener('click', this.handleActivity);
      window.removeEventListener('keydown', this.handleActivity);
      window.removeEventListener('mousemove', this.handleActivity);
      window.removeEventListener('scroll', this.handleActivity);
      window.removeEventListener('touchstart', this.handleActivity);
      
      // Clear interval
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
    }
  
    /**
     * Handle activity events
     */
    handleActivity(event) {
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastActivityTime;
      
      // Throttle mouse move events (only count if >1 second since last)
      if (event.type === 'mousemove' && timeSinceLastActivity < 1000) {
        return;
      }
      
      // Update activity counters
      switch(event.type) {
        case 'click':
          this.activityCount.clicks++;
          break;
        case 'keydown':
          this.activityCount.keystrokes++;
          break;
        case 'mousemove':
          this.activityCount.mouseMoves++;
          break;
        case 'scroll':
          this.activityCount.scrolls++;
          break;
      }
      
      this.lastActivityTime = now;
      
      // If was idle, mark as active again
      if (this.isIdle) {
        this.isIdle = false;
        this.onActive({
          idleDuration: timeSinceLastActivity,
          timestamp: now
        });
        console.log('✅ User active again after', (timeSinceLastActivity / 1000).toFixed(0), 'seconds');
      }
      
      // Trigger activity callback
      this.onActivity({
        type: event.type,
        timestamp: now,
        activityCount: { ...this.activityCount }
      });
    }
  
    /**
     * Check if user is idle
     */
    checkIdleState() {
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastActivityTime;
      
      // Check if exceeded idle threshold
      if (!this.isIdle && timeSinceLastActivity > this.idleThreshold) {
        this.isIdle = true;
        this.onIdle({
          idleDuration: timeSinceLastActivity,
          timestamp: now,
          lastActivity: this.lastActivityTime
        });
        console.log('⏰ User went idle after', (timeSinceLastActivity / 1000).toFixed(0), 'seconds');
      }
    }
  
    /**
     * Get current activity metrics
     */
    getMetrics() {
      const now = Date.now();
      const sessionDuration = now - this.sessionStart;
      const timeSinceLastActivity = now - this.lastActivityTime;
      
      return {
        sessionDuration,
        isIdle: this.isIdle,
        timeSinceLastActivity,
        activityCount: { ...this.activityCount },
        activityRate: {
          clicksPerMinute: (this.activityCount.clicks / (sessionDuration / 60000)).toFixed(2),
          keystrokesPerMinute: (this.activityCount.keystrokes / (sessionDuration / 60000)).toFixed(2)
        }
      };
    }
  
    /**
     * Reset activity counters
     */
    resetCounters() {
      this.activityCount = {
        clicks: 0,
        keystrokes: 0,
        mouseMoves: 0,
        scrolls: 0
      };
      this.sessionStart = Date.now();
    }
  
    /**
     * Get idle status
     */
    getIdleStatus() {
      return {
        isIdle: this.isIdle,
        timeSinceLastActivity: Date.now() - this.lastActivityTime
      };
    }
  }
  
  export default ActivityTracker;