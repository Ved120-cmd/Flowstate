// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to signup if not authenticated
    return <Navigate to="/signup" replace />;
  }
  
  return children;
};

export default ProtectedRoute;