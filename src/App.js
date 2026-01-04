import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import CreateGroup from './components/Groups/CreateGroup';
import JoinGroup from './components/Groups/JoinGroup';
import GroupDetail from './components/Groups/GroupDetail';
import GroupsList from './components/Groups/GroupsList';

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Navbar />
    <Outlet />
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Inhe PublicRoute se wrap kiya taaki login ke baad ye access na ho */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<GroupsList />} />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/groups/join" element={<JoinGroup />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
          </Route>

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;