import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Lazy load components
  const SignUp = React.lazy(() => import('./pages/signup'));
  const Questionnaire = React.lazy(() => import('./pages/Questionnaire'));
  const Dash = React.lazy(() => import('./pages/dash'));
  const Profile = React.lazy(() => import('./pages/Profile'));
  const AnalyticsDashboard = React.lazy(() => import('./pages/AnalyticsDashboard'));
  const EndOfDaySummary = React.lazy(() => import('./pages/EndOfDaySummary'));
  const TeamCollaboration = React.lazy(() => import('./pages/TeamCollaboration'));

  return (
    <Router>
      <React.Suspense fallback={
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading FlowState...</p>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute>
                <Questionnaire />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-summary"
            element={
              <ProtectedRoute>
                <EndOfDaySummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamCollaboration />
              </ProtectedRoute>
            }
          />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;