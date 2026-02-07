import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Profile from './pages/Profile';

function App() {
  // Lazy load components
  const SignUp = React.lazy(() => import('./pages/signup'));
  const Questionnaire = React.lazy(() => import('./pages/Questionnaire'));
  const Dash = React.lazy(() => import('./pages/dash'));
  const AnalyticsDashboard = React.lazy(() => import('./pages/AnalyticsDashboard'));
  const EndOfDaySummary = React.lazy(() => import('./pages/EndOfDaySummary'));
  const TeamCollaboration = React.lazy(() => import('./pages/TeamCollaboration')); // ADDED

  return (
    <Router>
      <React.Suspense fallback={
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading FlowState...</p>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/dashboard" element={<Dash />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/daily-summary" element={<EndOfDaySummary />} />
          <Route path="/team" element={<TeamCollaboration />} /> {/* ADDED */}
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;