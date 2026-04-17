import React from 'react';
import { Navigate } from 'react-router';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { motion } from "framer-motion";

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminPageWrapper({ children, title, description, actions }: AdminPageWrapperProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-[1600px] mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Page Header */}
          {(title || description || actions) && (
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between group">
              <div>
                {title && (
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-slate-500 font-medium max-w-2xl">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                  {actions}
                </div>
              )}
            </div>
          )}
          
          {/* Page Content */}
          <div className="space-y-8">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
