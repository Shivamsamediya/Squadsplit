import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import CreateGroup from './components/Groups/CreateGroup';
import JoinGroup from './components/Groups/JoinGroup';
import GroupDetail from './components/Groups/GroupDetail';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/groups/create"
              element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <CreateGroup />
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/groups/join"
              element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <JoinGroup />
                  </div>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <GroupDetail />
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
