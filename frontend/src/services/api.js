// frontend/src/services/api.js - UPDATED with Activity Tracking
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid

      console.log("401-detected: Clearing auth data and redirecting to signup");
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // window.location.href = '/signup';
    }
    return Promise.reject(error);
  }
);

// Get user ID from token or localStorage
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id || null;
  } catch {
    return null;
  }
};

// Auth endpoints
export const authAPI = {
  requestOTP: (email) => api.post('/auth/request-otp', { email }),
  verifyOTP: (email, otp, displayName) => api.post('/auth/verify-otp', { email, otp, displayName }),
  savePreferences: (preferences) => api.post('/auth/save-preferences', preferences),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Task endpoints
export const taskAPI = {
  getTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Activity endpoints
export const activityAPI = {
  logActivity: (activityData) => api.post('/activity', activityData),
  getActivities: () => api.get('/activity'),
};

// Session endpoints
export const sessionAPI = {
  startSession: (sessionData) => api.post('/session/start', sessionData),
  endSession: (sessionId) => api.post('/session/end', { sessionId }),
  getSessions: () => api.get('/session'),
};

// Energy endpoints
export const energyAPI = {
  logEnergy: (energyData) => api.post('/energy', energyData),
  getEnergyLevels: () => api.get('/energy'),
};

// Analytics endpoints
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getInsights: () => api.get('/analytics/insights'),
};

// Velocity endpoints (ML-powered when using mlvelocity backend)
export const velocityAPI = {
  // ===== ACTIVITY TRACKING (NEW) =====
  // Record user activity (clicks, keystrokes, mouse, scroll, idle)
  // Maps to: POST /api/activity (activityController.recordActivity)
  recordActivity: (activityData) => {
    return api.post('/velocity/activity', {
      activityType: activityData.activityType || 'activity',
      clicks: activityData.clicks || 0,
      keystrokes: activityData.keystrokes || 0,
      mouseMoves: activityData.mouseMoves || 0,
      scrolls: activityData.scrolls || 0,
      idleDuration: activityData.idleDuration || 0,
      taskId: activityData.taskId || null,
      timestamp: activityData.timestamp || Date.now()
    });
  },

  // Get activity session metrics
  // Maps to: GET /api/activity/session
  getSessionMetrics: () => api.get('/activity/session'),

  // Reset activity session
  // Maps to: POST /api/activity/reset
  resetActivitySession: () => api.post('/activity/reset'),

  // ===== TASK TRACKING (UPDATED) =====
  // Record task start
  // Maps to: POST /api/activity/task/start (activityController.recordTaskStart)
  recordTaskStart: (taskId, complexity = 'medium') => {
    const complexityValue = complexity === 'low' ? 1 : complexity === 'medium' ? 3 : 5;
    return api.post('/velocity/task/start', {
      taskId,
      complexity: complexityValue
    });
  },

  // Record task completion (trains ML model)
  // Maps to: POST /api/activity/task/complete (activityController.recordTaskComplete)
  recordTaskCompletion: (taskId, duration, complexity = 'medium') => {
    const complexityValue = complexity === 'low' ? 1 : complexity === 'medium' ? 3 : 5;
    return api.post('/velocity/task/complete', {
      taskId,
      duration, // in minutes
      complexity: complexityValue
    });
  },

  // ===== VELOCITY & PREDICTIONS =====
  // Get personalized velocity and recommendations (ML-powered)
  // Maps to: GET /api/velocity/personalized (activityController.getPersonalizedVelocity)
  getPersonalized: () => api.get('/velocity/personalized'),

  // Get current velocity (legacy, non-ML)
  getCurrent: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/velocity/current', {
      params: { userId }
    });
  },

  // ===== FEEDBACK & LEARNING =====
  // Record intervention feedback (helps ML model learn)
  // Maps to: POST /api/velocity/feedback (activityController.recordFeedback)
  recordInterventionFeedback: (suggestionType, accepted) => {
    return api.post('/velocity/feedback', {
      suggestionType,
      accepted
    });
  },

  // Legacy method for backwards compatibility
  sendInterventionFeedback: (data) => {
    return api.post('/velocity/feedback', {
      suggestionType: data.interventionType || data.type,
      accepted: data.accepted
    });
  },

  // ===== LEGACY METHODS (kept for compatibility) =====
  recordTaskPause: (taskId) => {
    return api.post('/activity', {
      activityType: 'task_pause',
      taskId,
      timestamp: Date.now()
    });
  },

  recordError: (errorType, errorData = {}) => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/error', {
      userId,
      errorType,
      errorData,
      timestamp: Date.now()
    });
  },

  getState: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/velocity/state', {
      params: { userId }
    });
  },

  getModelState: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/ml/model/state', {
      params: { userId }
    });
  },

  resetModel: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/ml/model/reset', { userId });
  },

  resetSession: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/session/reset', { userId });
  },

  checkIdle: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/idle/check', {
      params: { userId }
    });
  }
};

export default api;