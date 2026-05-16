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
  ExternalLink,
  HelpCircle,
  Bell
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { notificationService } from '../../services/notificationService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '../ui/dialog';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = React.useState(false);
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notifMenuRef = React.useRef<HTMLDivElement>(null);

  // Load notifications
  React.useEffect(() => {
    const loadNotifs = async () => {
      try {
        const [count, list] = await Promise.all([
          notificationService.getUnreadCount(),
          notificationService.getNotifications()
        ]);
        setNotificationCount(count || 0);
        setNotifications(list || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifs();
    const interval = setInterval(loadNotifs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

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
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
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
            {/* Notifications */}
            <div className="relative" ref={notifMenuRef}>
              <button 
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 rounded-full text-white font-bold border-none shadow-sm">
                    {notificationCount}
                  </Badge>
                )}
              </button>
              
              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-sm text-slate-900">Thông báo</h3>
                    {notificationCount > 0 && (
                      <button 
                        onClick={async () => {
                          await notificationService.markAllAsRead();
                          setNotificationCount(0);
                          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">Không có thông báo nào</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                          onClick={async () => {
                            if (!n.isRead) {
                              await notificationService.markAsRead(n.id);
                              setNotificationCount(prev => Math.max(0, prev - 1));
                              setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, isRead: true } : notif));
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${n.type === 'SYSTEM' ? 'text-amber-600' : 'text-indigo-600'}`}>
                              {n.type}
                            </span>
                            <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <p className={`text-sm font-bold text-slate-900 ${!n.isRead ? 'pr-2' : ''}`}>{n.title}</p>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Guide Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:bg-slate-100 h-10 w-10">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-indigo-600" />
                    Hướng dẫn sử dụng GearFlow Admin
                  </DialogTitle>
                  <DialogDescription>
                    Chào mừng bạn đến với hệ thống quản trị GearFlow. Dưới đây là hướng dẫn cơ bản để bạn làm quen với hệ thống.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <section>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      1. Trang tổng quan
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Nơi hiển thị các thống kê nhanh về doanh thu, số lượng đơn hàng, sản phẩm và khách hàng. Các biểu đồ giúp bạn theo dõi xu hướng kinh doanh theo thời gian.
                    </p>
                  </section>
                  <section>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-500" />
                      2. Quản lý sản phẩm
                    </h3>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-4">
                      <li>Xem danh sách sản phẩm hiện có.</li>
                      <li>Thêm sản phẩm mới với các thông tin cơ bản.</li>
                      <li>Quản lý biến thể (Switch, màu sắc, keycap, kết nối) và tồn kho từng loại.</li>
                      <li>Cập nhật hình ảnh và mô tả sản phẩm.</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-indigo-500" />
                      3. Quản lý đơn hàng
                    </h3>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 ml-4">
                      <li>Theo dõi danh sách đơn hàng mới và lịch sử.</li>
                      <li>Cập nhật trạng thái đơn hàng (Chờ xử lý, Đang giao, Đã giao, Đã hủy).</li>
                      <li>Xem chi tiết thông tin thanh toán và địa chỉ giao hàng.</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      4. Quản lý khách hàng
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Quản lý danh sách người dùng, xem lịch sử mua hàng và thông tin liên hệ của khách hàng.
                    </p>
                  </section>
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                    <p className="text-xs text-indigo-700 font-medium italic">
                      Lưu ý: Luôn kiểm tra kỹ thông tin trước khi cập nhật trạng thái đơn hàng hoặc xóa sản phẩm. Hệ thống sẽ tự động gửi thông báo cho khách hàng khi trạng thái đơn hàng thay đổi.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
