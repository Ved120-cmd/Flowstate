import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; // This contains your dashboard CSS + the new loading spinner CSS

function App() {
  // Lazy load components
  const SignUp = React.lazy(() => import('./pages/signup'));
  const Questionnaire = React.lazy(() => import('./pages/Questionnaire'));
  const Dash = React.lazy(() => import('./pages/dash'));

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
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;
