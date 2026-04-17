import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, User, Heart, LayoutDashboard, LogOut, Keyboard, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = location.pathname.startsWith('/admin');

  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <Keyboard className="text-white w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900">GEAR<span className="text-blue-600">FLOW</span></span>
            </Link>

            {!isAdmin && (
              <nav className="hidden md:flex items-center space-x-10">
                {[
                  { name: 'Trang chủ', path: '/' },
                  { name: 'Sản phẩm', path: '/shop' },
                  { name: 'Yêu thích', path: '/wishlist' },
                  { name: 'Đơn hàng', path: '/orders' },
                ].map((link) => {
                  const isActive = location.pathname === link.path;
                  if (!isAuthenticated && (link.path === '/wishlist' || link.path === '/orders')) return null;
                  
                  return (
                    <Link 
                      key={link.path}
                      to={link.path} 
                      className={`relative py-2 text-sm font-bold transition-colors group ${
                        isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {link.name}
                      <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform origin-left transition-transform duration-300 ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`} />
                    </Link>
                  );
                })}
              </nav>
            )}

            {!isAdmin && (
              <div className="flex-1 max-w-md mx-8 hidden lg:block">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input 
                    type="text"
                    placeholder="Tìm kiếm phím cơ, keycap..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl pl-10 h-10 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </form>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {!isAdmin ? (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link to="/wishlist">
                        <Button variant="ghost" size="icon">
                          <Heart className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Link to="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                          <ShoppingCart className="h-5 w-5" />
                          {cartCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                              {cartCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <span className="hidden md:inline">{user?.username || 'User'}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <div className="px-2 py-1.5 text-sm font-semibold">
                            {user?.username}
                          </div>
                          <div className="px-2 py-1.5 text-xs text-gray-500">
                            {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                          </div>
                          <div className="border-t my-1"></div>
                          <DropdownMenuItem asChild>
                            <Link to="/profile" className="cursor-pointer">Hồ sơ cá nhân</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/orders" className="cursor-pointer">Đơn hàng của tôi</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/change-password" className="cursor-pointer">Đổi mật khẩu</Link>
                          </DropdownMenuItem>
                          {user?.role === 'ADMIN' && (
                            <>
                              <div className="border-t my-1"></div>
                              <DropdownMenuItem asChild>
                                <Link to="/admin" className="cursor-pointer">
                                  <LayoutDashboard className="h-4 w-4 mr-2" />
                                  Quản lý
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <div className="border-t my-1"></div>
                          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                            <LogOut className="h-4 w-4 mr-2" />
                            Đăng xuất
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button variant="outline" size="sm">
                          Đăng nhập
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button size="sm">
                          Đăng ký
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <Link to="/">
                  <Button variant="outline" size="sm">
                    Về cửa hàng
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      {!isAdmin && (
        <footer className="bg-slate-950 text-white mt-0 border-t border-slate-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <Link to="/" className="flex items-center space-x-2 mb-6 group">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Keyboard className="text-white w-6 h-6" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter">GEAR<span className="text-blue-600">FLOW</span></span>
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
                  Chuyên cung cấp bàn phím cơ và phụ kiện Custom cao cấp. Chúng tôi mang đến cảm giác gõ tốt nhất cho mọi đối tượng từ làm việc đến chơi game chuyên nghiệp.
                </p>
                <div className="flex space-x-5">
                   {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                    <a key={social} href="#" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg border border-slate-800">
                      <span className="sr-only">{social}</span>
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Mua Sắm</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Tất cả sản phẩm</Link></li>
                  <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Bàn phím cơ</Link></li>
                  <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Keycap Sets</Link></li>
                  <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Custom Kits</Link></li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Hỗ Trợ</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách bảo hành</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách đổi trả</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Vận chuyển</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Điều khoản</a></li>
                </ul>
              </div>

              <div className="md:col-span-4">
                <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Bản Tin</h4>
                <p className="text-sm text-slate-400 mb-4">Đăng ký để nhận sớm các ưu đãi đặc biệt và cập nhật mới nhất.</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Email của bạn..." 
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-bold">Gửi</Button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[13px] text-slate-500">
              <p>© 2026 GearFlow Team. All rights reserved.</p>
              <div className="flex space-x-8 mt-4 md:mt-0">
                <a href="#" className="hover:text-slate-300">Quyền riêng tư</a>
                <a href="#" className="hover:text-slate-300">Điều khoản dịch vụ</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}