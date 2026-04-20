import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';

interface ModernStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo' | 'red' | 'yellow';
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-500/20',
  },
  green: {
    bg: 'from-green-500 to-emerald-600',
    light: 'bg-green-50',
    text: 'text-green-600',
    ring: 'ring-green-500/20',
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-500/20',
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'ring-orange-500/20',
  },
  pink: {
    bg: 'from-pink-500 to-pink-600',
    light: 'bg-pink-50',
    text: 'text-pink-600',
    ring: 'ring-pink-500/20',
  },
  indigo: {
    bg: 'from-indigo-500 to-indigo-600',
    light: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'ring-indigo-500/20',
  },
  red: {
    bg: 'from-red-500 to-red-600',
    light: 'bg-red-50',
    text: 'text-red-600',
    ring: 'ring-red-500/20',
  },
  yellow: {
    bg: 'from-yellow-500 to-yellow-600',
    light: 'bg-yellow-50',
    text: 'text-yellow-600',
    ring: 'ring-yellow-500/20',
  },
};

export function ModernStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  className = '',
}: ModernStatCardProps) {
  const colors = colorClasses[color];

  return (
    <Card
      className={`relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ${colors.ring} ring-4 ${className}`}
    >
      {/* Animated Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />

      {/* Decorative Circles */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 ${colors.light} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700`}
      />
      <div
        className={`absolute -bottom-10 -left-10 w-32 h-32 ${colors.light} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700`}
      />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                {value}
              </h3>
              {trend && trendValue && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    trend === 'up'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span>{trend === 'up' ? '↑' : '↓'}</span>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>
            )}
          </div>

          <div
            className={`p-4 bg-gradient-to-br ${colors.bg} rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: trend === 'up' ? '75%' : '45%' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
