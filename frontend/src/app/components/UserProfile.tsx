import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { User, ShoppingBag, Heart, Lock, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { toast } from "sonner";

export function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, wishlist] = await Promise.all([
        apiService.getOrders(),
        apiService.getWishlist()
      ]);
      setOrderCount(orders.length);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
        <Link to="/login">
          <Button>Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Tổng đơn hàng', value: orderCount.toString(), icon: ShoppingBag },
    { label: 'Sản phẩm yêu thích', value: wishlistCount.toString(), icon: Heart },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.username}</h2>
                  <p className="text-gray-600">
                    {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Tên đăng nhập:</span>
                  <span className="font-semibold">{user.username}</span>
                </div>
                {user.phone && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-semibold">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-semibold">{user.address}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Ngày tham gia:</span>
                  <span className="font-semibold">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <Button className="w-full mt-6" disabled>
                Cập nhật thông tin
              </Button>
            </CardContent>
          </Card>

          {user.address && (
            <Card>
              <CardHeader>
                <CardTitle>Địa chỉ giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">Địa chỉ mặc định</p>
                      <p className="text-sm text-gray-600 mt-1">{user.username}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-600">{user.phone}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{user.address}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Thêm địa chỉ mới
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {!loading && (
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quản lý tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Đơn hàng của tôi
                </Button>
              </Link>
              <Link to="/wishlist" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Danh sách yêu thích
                </Button>
              </Link>
              <Link to="/change-password" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
