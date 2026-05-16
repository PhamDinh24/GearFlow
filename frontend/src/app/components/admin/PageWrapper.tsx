import React from 'react';
import { motion } from "framer-motion";

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  helpTitle?: string;
  helpContent?: string;
}

import { HelpTooltip } from '../common/HelpTooltip';

export function AdminPageWrapper({ 
  children, 
  title, 
  description, 
  actions,
  helpTitle,
  helpContent 
}: AdminPageWrapperProps) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Page Header */}
          {(title || description || actions) && (
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                {title && (
                  <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-4xl font-bold text-slate-900">
                      {title}
                    </h1>
                    {helpContent && (
                      <HelpTooltip title={helpTitle || title} content={helpContent} />
                    )}
                  </div>
                )}
                {description && (
                  <p className="text-slate-600 text-lg max-w-2xl">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex flex-wrap gap-3">
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
