import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Sirf logged in users ke liye (Dashboard etc.)
export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Sirf un-authenticated users ke liye (Login/Signup page)
export const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    // Agar user pehle se login hai, toh use dashboard bhej do
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};