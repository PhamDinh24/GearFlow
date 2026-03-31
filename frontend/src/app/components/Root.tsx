import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, User, Heart, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg"></div>
              <span className="font-bold text-xl">GearFlow</span>
            </Link>

            {!isAdmin && (
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-700 hover:text-gray-900">
                  Trang chủ
                </Link>
                <Link to="/shop" className="text-gray-700 hover:text-gray-900">
                  Sản phẩm
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/wishlist" className="text-gray-700 hover:text-gray-900">
                      Yêu thích
                    </Link>
                    <Link to="/orders" className="text-gray-700 hover:text-gray-900">
                      Đơn hàng
                    </Link>
                  </>
                )}
              </nav>
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
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">GearFlow</h3>
                <p className="text-gray-400 text-sm">
                  Chuyên cung cấp bàn phím cơ cao cấp cho mọi nhu cầu
                </p>
                <div className="mt-4 flex space-x-4">
                  <Link to="/" className="text-gray-400 hover:text-white">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </Link>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                    </svg>
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Liên kết</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/" className="hover:text-white">Trang chủ</Link></li>
                  <li><Link to="/shop" className="hover:text-white">Sản phẩm</Link></li>
                  {isAuthenticated && (
                    <>
                      <li><Link to="/orders" className="hover:text-white">Đơn hàng</Link></li>
                      <li><Link to="/wishlist" className="hover:text-white">Yêu thích</Link></li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Chính sách</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white">Chính sách bảo hành</a></li>
                  <li><a href="#" className="hover:text-white">Chính sách đổi trả</a></li>
                  <li><a href="#" className="hover:text-white">Chính sách vận chuyển</a></li>
                  <li><a href="#" className="hover:text-white">Điều khoản sử dụng</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Liên hệ</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Hotline: 1900-xxxx</li>
                  <li>Email: support@gearflow.vn</li>
                  <li>Địa chỉ: Hà Nội, Việt Nam</li>
                  <li className="pt-2">
                    <span className="text-white">Giờ làm việc:</span><br/>
                    T2-T6: 8:00 - 18:00<br/>
                    T7-CN: 9:00 - 17:00
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>© 2026 GearFlow. All rights reserved.</p>
              <p className="mt-2">Designed with ❤️ for keyboard enthusiasts</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}