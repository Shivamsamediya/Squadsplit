import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

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

/* =========================
   Protected Layout
   ========================= */

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

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups/create" element={<CreateGroup />} />
            <Route path="/groups/join" element={<JoinGroup />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
