import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Home, LogOut, LayoutDashboard, Package, Tag, ShoppingCart, Users, Upload, Keyboard, Settings, FolderTree, Star } from 'lucide-react';
import { Button } from '../ui/button';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-slate-900 text-white shadow-2xl border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-slate-950/90">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/favicon.svg" 
              alt="GearFlow Logo" 
              className="w-12 h-12 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="hidden sm:block">
               <h1 className="text-xl font-black tracking-tighter uppercase mb-0.5">GEARFLOW <span className="text-blue-500">ADMIN</span></h1>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">System Live</span>
               </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden xl:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 mx-8">
            {[
              { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
              { to: "/admin/products", icon: Package, label: "Sản Phẩm" },
              { to: "/admin/categories", icon: FolderTree, label: "Danh Mục" },
              { to: "/admin/brands", icon: Tag, label: "Thương Hiệu" },
              { to: "/admin/orders", icon: ShoppingCart, label: "Đơn Hàng" },
              { to: "/admin/customers", icon: Users, label: "Khách Hàng" },
              { to: "/admin/reviews", icon: Star, label: "Đánh Giá" },
              { to: "/admin/import-export", icon: Upload, label: "Nhập/Xuất" },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-black uppercase tracking-widest text-white">{user?.username}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Administrator</span>
             </div>
             
             <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                <Link to="/">
                   <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Về cửa hàng">
                      <Home className="w-5 h-5" />
                   </Button>
                </Link>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-slate-800 transition-all text-slate-400">
                   <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="w-10 h-10 rounded-xl hover:bg-red-600 hover:text-white transition-all text-red-500/70" title="Đăng xuất">
                   <LogOut className="w-5 h-5" />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

