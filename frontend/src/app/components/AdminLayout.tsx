import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { AdminNav } from './AdminNav';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNav />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
