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

// Auth endpoints
export const authAPI = {
  requestOTP: (email) => api.post('/auth/request-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
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

// Velocity endpoints
export const velocityAPI = {
  getCurrent: () => api.get('/velocity/current'),
  getHistory: () => api.get('/velocity/history'),
};

export default api;