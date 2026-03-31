import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export const AdminNav: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Sản Phẩm', icon: '📦' },
    { path: '/admin/orders', label: 'Đơn Hàng', icon: '🛒' },
    { path: '/admin/customers', label: 'Khách Hàng', icon: '👥' },
    { path: '/admin/inventory', label: 'Kho Hàng', icon: '📋' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">GearFlow Admin</h1>
        <p className="text-gray-400 text-sm">Quản lý hệ thống</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-700">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors mb-2"
        >
          <span className="text-xl">🏠</span>
          <span className="font-medium">Về Trang Chủ</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Đăng Xuất</span>
        </button>
      </div>
    </div>
  );
};
