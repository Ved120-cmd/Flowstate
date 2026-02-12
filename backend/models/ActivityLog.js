/**
 * Activity Log Model
 * Tracks all user activity for ML velocity predictions
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // ✅ Changed from 'type' to 'activityType' to match controller
  activityType: {
    type: String,
    enum: [
      'activity',        // General activity tracking
      'task_start',      // Task started
      'task_complete',   // Task completed
      'task_pause',      // Task paused
      'feedback',        // User feedback on suggestions
      'idle',            // User went idle
      'active',          // User became active again
      'error'            // Error occurred
    ],
    required: true
  },
  
  // Activity metrics
  clicks: {
    type: Number,
    default: 0
  },
  
  keystrokes: {
    type: Number,
    default: 0
  },
  
  mouseMoves: {
    type: Number,
    default: 0
  },
  
  scrolls: {
    type: Number,
    default: 0
  },
  
  idleDuration: {
    type: Number,
    default: 0
  },
  
  // Task-related fields
  taskId: {
    type: String,
    default: null
  },
  
  taskComplexity: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  duration: {
    type: Number,
    default: null
  },
  
  // Additional metadata (for backward compatibility)
  metadata: {
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

// Indexes for efficient queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, activityType: 1 });
activityLogSchema.index({ userId: 1, activityType: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);