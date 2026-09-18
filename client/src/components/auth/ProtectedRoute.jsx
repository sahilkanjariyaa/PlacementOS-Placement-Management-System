import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Checking authorization..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their respective default home
    const defaultHome =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'recruiter'
        ? '/recruiter/dashboard'
        : '/student/dashboard';
    return <Navigate to={defaultHome} replace />;
  }

  return children ? children : <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner text="Restoring active session..." size="lg" />
      </div>
    );
  }

  if (user) {
    const defaultHome =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'recruiter'
        ? '/recruiter/dashboard'
        : '/student/dashboard';
    return <Navigate to={defaultHome} replace />;
  }

  return <Outlet />;
};
