/**
 * Engagement Tracking Middleware
 * Tracks user activity, idle time, and errors
 */

class EngagementTracker {
  constructor() {
    this.sessions = new Map(); // userId -> session data
    
    // Configuration
    this.IDLE_THRESHOLD_MS = 30000; // 30 seconds of no activity = idle
    this.WINDOW_SIZE_MS = 60000;    // 1-minute tracking windows
  }

  /**
   * Initialize or get session for a user
   */
  getSession(userId) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        windowStart: Date.now(),
        
        // Current window metrics
        currentWindow: {
          tasksCompleted: 0,
          completionTime: 0,
          idleTime: 0,
          totalTime: 0,
          errorCount: 0,
          activities: []
        },
        
        // Activity log
        activityLog: [],
        
        // Error tracking
        errors: []
      });
    }
    return this.sessions.get(userId);
  }

  /**
   * Record user activity (typing, clicking, etc.)
   */
  recordActivity(userId, activityType, data = {}) {
    const session = this.getSession(userId);
    const now = Date.now();
    
    // Check if we need to start a new window
    const windowElapsed = now - session.windowStart;
    if (windowElapsed >= this.WINDOW_SIZE_MS) {
      this.finalizeWindow(userId);
    }
    
    // Calculate idle time since last activity
    const timeSinceLastActivity = now - session.lastActivity;
    if (timeSinceLastActivity > this.IDLE_THRESHOLD_MS) {
      session.currentWindow.idleTime += timeSinceLastActivity;
    }
    
    // Record activity
    const activity = {
      type: activityType,
      timestamp: now,
      data
    };
    
    session.activityLog.push(activity);
    session.currentWindow.activities.push(activity);
    session.lastActivity = now;
    
    return activity;
  }

  /**
   * Record task completion
   */
  recordTaskCompletion(userId, taskData) {
    const session = this.getSession(userId);
    const { taskId, duration, complexity } = taskData;
    
    this.recordActivity(userId, 'task_completion', {
      taskId,
      duration,
      complexity
    });
    
    session.currentWindow.tasksCompleted++;
    session.currentWindow.completionTime += duration;
    
    return {
      success: true,
      tasksCompleted: session.currentWindow.tasksCompleted
    };
  }

  /**
   * Record error event
   */
  recordError(userId, errorType, errorData = {}) {
    const session = this.getSession(userId);
    const now = Date.now();
    
    const error = {
      type: errorType,
      timestamp: now,
      data: errorData
    };
    
    session.errors.push(error);
    session.currentWindow.errorCount++;
    
    this.recordActivity(userId, 'error', { errorType, ...errorData });
    
    return error;
  }

  /**
   * Record specific error types
   */
  recordUndoRedo(userId) {
    return this.recordError(userId, 'undo_redo');
  }

  recordValidationFailure(userId, fieldName) {
    return this.recordError(userId, 'validation_failure', { fieldName });
  }

  recordCopyPasteCorrection(userId) {
    return this.recordError(userId, 'copy_paste_correction');
  }

  /**
   * Finalize current window and prepare metrics
   */
  finalizeWindow(userId) {
    const session = this.getSession(userId);
    const now = Date.now();
    
    // Calculate total time for the window
    session.currentWindow.totalTime = (now - session.windowStart) / 60000; // in minutes
    
    // Get metrics for velocity calculation
    const metrics = {
      completionTime: session.currentWindow.completionTime || 1, // Avoid division by zero
      idleTime: session.currentWindow.idleTime / 60000, // Convert to minutes
      totalTime: session.currentWindow.totalTime,
      errorCount: session.currentWindow.errorCount
    };
    
    // Reset for next window
    session.windowStart = now;
    session.currentWindow = {
      tasksCompleted: 0,
      completionTime: 0,
      idleTime: 0,
      totalTime: 0,
      errorCount: 0,
      activities: []
    };
    
    return metrics;
  }

  /**
   * Get current window metrics (for real-time updates)
   */
  getCurrentMetrics(userId) {
    const session = this.getSession(userId);
    const now = Date.now();
    
    const elapsedTime = (now - session.windowStart) / 60000; // in minutes
    const idleTime = session.currentWindow.idleTime / 60000;
    
    return {
      completionTime: session.currentWindow.completionTime || elapsedTime || 1,
      idleTime,
      totalTime: elapsedTime || 1,
      errorCount: session.currentWindow.errorCount
    };
  }

  /**
   * Get session summary
   */
  getSessionSummary(userId) {
    const session = this.getSession(userId);
    const now = Date.now();
    
    return {
      userId,
      sessionDuration: (now - session.startTime) / 60000, // in minutes
      totalActivities: session.activityLog.length,
      totalErrors: session.errors.length,
      currentWindow: {
        ...session.currentWindow,
        elapsedTime: (now - session.windowStart) / 1000 // in seconds
      }
    };
  }

  /**
   * Check for idle status
   */
  isUserIdle(userId) {
    const session = this.getSession(userId);
    const timeSinceLastActivity = Date.now() - session.lastActivity;
    return timeSinceLastActivity > this.IDLE_THRESHOLD_MS;
  }

  /**
   * Clear session data
   */
  clearSession(userId) {
    this.sessions.delete(userId);
  }
}

module.exports = EngagementTracker;