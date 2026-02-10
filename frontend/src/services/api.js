// frontend/src/services/api.js
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signup';
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
  // Record activity (automatically trains ML model)
  recordActivity: (activityType, data = {}) => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/activity', {
      userId,
      activityType,
      data,
      timestamp: Date.now()
    });
  },

  // Record task completion (trains ML model with task data)
  recordTaskCompletion: (taskId, duration, complexity = 'medium') => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/task/complete', {
      userId,
      taskId,
      duration,
      complexity,
      timestamp: Date.now()
    });
  },

  // Record task start
  recordTaskStart: (taskId, complexity = 'medium') => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/activity', {
      userId,
      activityType: 'task_start',
      data: { taskId, complexity },
      timestamp: Date.now()
    });
  },

  // Record task pause
  recordTaskPause: (taskId) => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/activity', {
      userId,
      activityType: 'task_pause',
      data: { taskId },
      timestamp: Date.now()
    });
  },

  // Record error event
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

  // Get personalized velocity and recommendations (ML-powered)
  // Uses JWT userId from auth middleware, no need to pass userId param
  getPersonalized: () => api.get('/velocity/personalized'),

  // Get current velocity (legacy, non-ML) - requires userId param
  getCurrent: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/velocity/current', {
      params: { userId }
    });
  },

  // Get velocity state
  getState: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/velocity/state', {
      params: { userId }
    });
  },

  // Get ML model state (for debugging)
  getModelState: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/ml/model/state', {
      params: { userId }
    });
  },

  // Record intervention feedback (helps ML model learn)
  recordInterventionFeedback: (interventionType, accepted, velocityBefore, velocityAfter) => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/intervention/feedback', {
      userId,
      interventionType,
      accepted,
      velocityBefore,
      velocityAfter,
      timestamp: Date.now()
    });
  },

  // Reset ML model (start fresh learning)
  resetModel: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/ml/model/reset', { userId });
  },

  // Reset session
  resetSession: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/session/reset', { userId });
  },

  // Check if idle
  checkIdle: () => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.get('/idle/check', {
      params: { userId }
    });
  },

  // Legacy: sendInterventionFeedback (kept for backwards compatibility)
  sendInterventionFeedback: (data) => {
    const userId = getUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found. Please log in.'));
    }
    return api.post('/intervention/feedback', {
      userId,
      ...data
    });
  },
};

export default api;