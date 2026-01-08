
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

interface ProtectedRouteProps {
  user: User | null;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedRoles, children }) => {
  const location = useLocation();

  if (!user) {
    // If trying to access admin routes, go to Admin Login, else show public auth
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
