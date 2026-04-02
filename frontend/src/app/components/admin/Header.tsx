import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Home, LogOut, LayoutDashboard, Package, Tag, ShoppingCart, Users, Upload } from 'lucide-react';

export function AdminHeader() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">GearFlow Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Sản Phẩm</span>
            </Link>
            <Link
              to="/admin/brands"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span>Thương Hiệu</span>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span>Danh Mục</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Đơn Hàng</span>
            </Link>
            <Link
              to="/admin/customers"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Khách Hàng</span>
            </Link>
            <Link
              to="/admin/import-export"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Nhập/Xuất</span>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">{user?.username}</span>
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Về trang chủ"
            >
              <Home className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AdminHeader as Header };
