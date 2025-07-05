import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  console.log('ProtectedRoute: User state:', user);

  if (!user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to /signin');
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}