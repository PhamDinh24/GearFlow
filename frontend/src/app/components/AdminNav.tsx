import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Award,
  MessageSquare, BarChart2, Menu, X, Layers
} from "lucide-react";

const navItems = [
  { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/admin/reports', label: 'Báo cáo', icon: BarChart2 },
  { path: '/admin/products', label: 'Sản phẩm', icon: Layers },
  { path: '/admin/inventory', label: 'Tồn kho', icon: Package },
  { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { path: '/admin/customers', label: 'Tài khoản', icon: Users },
  { path: '/admin/categories', label: 'Danh mục', icon: Tag },
  { path: '/admin/brands', label: 'Thương hiệu', icon: Award },
  { path: '/admin/payments', label: 'Thanh toán', icon: BarChart2 },
  { path: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare },
];

export function AdminNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
      {/* Desktop Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden md:flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/60'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {(() => {
                const current = navItems.find(item => item.path === location.pathname);
                const Icon = current?.icon || LayoutDashboard;
                return (
                  <>
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-600">{current?.label || 'Admin'}</span>
                  </>
                );
              })()}
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileOpen && (
            <div className="border-t border-slate-100 py-2 grid grid-cols-2 gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}