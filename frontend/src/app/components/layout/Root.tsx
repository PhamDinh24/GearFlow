import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { productService, type Product } from "../../services/productService";
import { cartService } from "../../services/cartService";
import { wishlistService } from "../../services/wishlistService";
import { ShoppingCart, User, Heart, LayoutDashboard, Search, X, LogOut, Package, Settings, ChevronDown, Menu, Keyboard, Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { notificationService } from "../../services/notificationService";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const isAdminPage = location.pathname.startsWith('/admin');

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const loadCounts = async () => {
    if (isLoggedIn) {
      try {
        const [cart, wishlist, notifCount, notifs] = await Promise.all([
          cartService.getCart(),
          wishlistService.getWishlist(),
          notificationService.getUnreadCount(),
          notificationService.getNotifications()
        ]);
        setCartCount(cart.totalItems || 0);
        setWishlistCount(wishlist.items?.length || 0);
        
        // Show toast for new notifications
        if (notifCount > notificationCount) {
          const newNotifs = notifs.filter((n: any) => !n.isRead);
          if (newNotifs.length > 0) {
            toast.info(`Bạn có thông báo mới: ${newNotifs[0].title}`, {
              description: newNotifs[0].message,
              action: {
                label: "Xem",
                onClick: () => setNotifMenuOpen(true)
              }
            });
          }
        }

        setNotificationCount(notifCount || 0);
        setNotifications(notifs || []);
      } catch (error) {
        console.error('Failed to load counts:', error);
      }
    } else {
      setCartCount(0);
      setWishlistCount(0);
      setNotificationCount(0);
      setNotifications([]);
    }
  };

  // Load cart count, wishlist count, and notifications
  useEffect(() => {
    loadCounts();

    // Polling for notifications every 30s
    let interval: any;
    if (isLoggedIn) {
      interval = setInterval(loadCounts, 10000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isLoggedIn]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const result = await productService.searchProducts(searchQuery, 0, 5);
        setSearchResults(result.content);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setNotifMenuOpen(false);
      }
    };
    
    // Listen for custom refresh events
    const refreshHandler = () => {
      console.log('Refresh counts event received');
      loadCounts();
    };
    
    document.addEventListener("mousedown", handler);
    window.addEventListener("refresh-counts", refreshHandler);
    
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("refresh-counts", refreshHandler);
    };
  }, [notificationCount]); // Use notificationCount to keep closure updated if needed

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/shop", label: "Sản phẩm" },
    { to: "/wishlist", label: "Yêu thích" },
    { to: "/orders", label: "Đơn hàng" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                <Keyboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">GearFlow</span>
            </Link>

            {/* Desktop Nav */}
            {!isAdminPage && (
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                      location.pathname === link.to
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {!isAdminPage && (
                <>
                  {/* Search */}
                  {searchOpen ? (
                    <form onSubmit={handleSearch} className="relative flex items-center">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          ref={searchInputRef}
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Tìm kiếm bàn phím..."
                          className="pl-9 pr-4 h-9 w-48 sm:w-64 rounded-xl border-slate-200 text-sm"
                        />
                        {/* Search dropdown */}
                        {(searchResults.length > 0 || isSearching) && (
                          <div className="absolute top-11 left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                            {isSearching ? (
                              <div className="p-4 text-center text-slate-500">Đang tìm kiếm...</div>
                            ) : (
                              <>
                                {searchResults.map(product => (
                                  <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                                  >
                                    <img 
                                      src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'} 
                                      alt={product.name} 
                                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0" 
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                                      <p className="text-xs text-slate-500">{product.basePrice.toLocaleString('vi-VN')}đ</p>
                                    </div>
                                  </Link>
                                ))}
                                <button
                                  type="submit"
                                  className="w-full p-3 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 border-t border-slate-100 transition-colors text-left"
                                >
                                  Xem tất cả kết quả cho "{searchQuery}" →
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="ml-1 p-2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  )}

                  {/* Wishlist */}
                  <Link to="/wishlist">
                    <button className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                      <Heart className="w-5 h-5" />
                      {wishlistCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-pink-600 rounded-full text-white font-bold border-none">
                          {wishlistCount}
                        </Badge>
                      )}
                    </button>
                  </Link>

                  {/* Cart */}
                  <Link to="/cart">
                    <button className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-indigo-600 rounded-full text-white font-bold border-none">
                          {cartCount}
                        </Badge>
                      )}
                    </button>
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <div className="flex items-center gap-1.5">
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

                  {/* User */}
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
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.username}</p>
                          {user?.phone && (
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate mt-0.5">{user.phone}</p>
                          )}
                        </div>
                        <div className="py-1">
                          <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                            <User className="w-4 h-4 text-slate-400" />
                            Thông tin tài khoản
                          </Link>
                          <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                            <Package className="w-4 h-4 text-slate-400" />
                            Đơn hàng của tôi
                          </Link>
                          <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                            <Heart className="w-4 h-4 text-slate-400" />
                            Danh sách yêu thích
                          </Link>
                          {isAdmin && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">
                              <LayoutDashboard className="w-4 h-4" />
                              Quản trị hệ thống
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-slate-100 py-1">
                          <Link to="/change-password" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                            <Settings className="w-4 h-4 text-slate-400" />
                            Đổi mật khẩu
                          </Link>
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
              )}

              {!isLoggedIn && (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="rounded-xl text-slate-700 hover:bg-slate-100 px-4 h-10 font-bold">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 h-10 font-bold shadow-lg shadow-slate-200">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}

              {!isAdminPage && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {isAdminPage && (
                <Link to="/" className="ml-2">
                  <Button variant="outline" size="sm" className="rounded-xl border-slate-300 font-bold h-10 px-4">
                    ← Về cửa hàng
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Nav */}
          {!isAdminPage && mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    location.pathname === link.to
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      {!isAdminPage && (
        <footer className="bg-slate-950 text-white mt-32 border-t border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/5 blur-[120px] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
              <div className="md:col-span-4">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Keyboard className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-black text-2xl tracking-tight">GearFlow</span>
                </div>
                <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                  GearFlow - Điểm đến hàng đầu cho cộng đồng đam mê bàn phím cơ tại Việt Nam. Chúng tôi mang đến trải nghiệm gõ phím hoàn hảo nhất.
                </p>
                <div className="flex gap-4 mt-8">
                  {['fb', 'ig', 'yt', 'tw'].map(social => (
                    <div key={social} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-indigo-500 transition-colors cursor-pointer group">
                      <div className="w-5 h-5 bg-slate-500 group-hover:bg-indigo-500 transition-colors rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-slate-200">Khám phá</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Bàn phím cơ</li>
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Switch Custom</li>
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Bộ Keycap</li>
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Phụ kiện</li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-slate-200">Hỗ trợ</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Chính sách bảo hành</li>
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Đổi trả 7 ngày</li>
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Hướng dẫn mua hàng</li>
                  <li className="hover:text-white transition-colors cursor-pointer font-medium">Liên hệ hỗ trợ</li>
                </ul>
              </div>

              <div className="md:col-span-4">
                <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-slate-200">Bản tin GearFlow</h4>
                <p className="text-sm text-slate-400 mb-6 font-medium">Nhận thông báo về các mẫu phím mới nhất và ưu đãi độc quyền.</p>
                <div className="flex gap-2">
                  <Input placeholder="Email của bạn..." className="bg-slate-900 border-slate-800 h-12 rounded-xl focus:ring-indigo-500 text-white" />
                  <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-xl font-bold">Đăng ký</Button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
              <p className="font-medium">© 2026 GearFlow Team. Build with ❤️ for Keyboard Community.</p>
              <div className="flex gap-8 mt-6 md:mt-0">
                <span className="hover:text-white transition-colors cursor-pointer font-medium">Điều khoản dịch vụ</span>
                <span className="hover:text-white transition-colors cursor-pointer font-medium">Quyền riêng tư</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
