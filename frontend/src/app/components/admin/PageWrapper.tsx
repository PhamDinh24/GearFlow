import React from 'react';
import { Navigate } from 'react-router';
import { AdminHeader } from './Header';
import { useAuth } from '../../context/AuthContext';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminPageWrapper({ children, title, description }: AdminPageWrapperProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          {(title || description) && (
            <div className="mb-8">
              {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
              {description && <p className="text-gray-600 mt-2">{description}</p>}
            </div>
          )}
          
          {/* Page Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
