import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Keyboard, 
  Settings, 
  FolderTree, 
  MessageSquare,
  Award,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Tổng quan", end: true },
    { to: "/admin/products", icon: Package, label: "Sản phẩm" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
    { to: "/admin/customers", icon: Users, label: "Tài khoản" },
    { to: "/admin/categories", icon: FolderTree, label: "Danh mục" },
    { to: "/admin/brands", icon: Award, label: "Thương hiệu" },
    { to: "/admin/reviews", icon: MessageSquare, label: "Đánh giá" },
  ];

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">GearFlow</span>
              <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Admin</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-xl text-slate-700 hover:bg-slate-100 px-4 h-10 font-bold gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden md:inline">Về cửa hàng</span>
              </Button>
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                  {user?.username}
                </span>
                <Settings className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-90' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.username}</p>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-wider truncate mt-0.5">Administrator</p>
                  </div>
                  <div className="py-1">
                    <Link to="/" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                      <Home className="w-4 h-4 text-slate-400" />
                      Về trang chủ
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
