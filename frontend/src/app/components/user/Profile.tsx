import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { User, ShoppingBag, Heart, MapPin, Lock, LogOut, ChevronRight, Edit3, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { orderApi, wishlistApi, userApi } from "../../services/api";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function Profile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadStats();
    if (user) {
      setFormData({
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [orders, wishlist] = await Promise.all([
        orderApi.getOrders(),
        wishlistApi.getWishlist(),
      ]);
      setOrderCount(orders.length);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error loading stats:', error);
      setOrderCount(0);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const updatedUser = await userApi.updateUserProfile(user.id, formData);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật thông tin');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-slate-200 border-2 border-slate-300 rounded-full mb-6 flex items-center justify-center">
            <User className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Vui lòng đăng nhập</h2>
        <p className="text-slate-500 mb-8 max-w-xs text-center">Bạn cần đăng nhập để quản lý thông tin cá nhân và xem lịch sử đơn hàng.</p>
        <Link to="/login">
          <Button className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl px-10 h-14 font-bold shadow-xl shadow-slate-200">Đăng nhập ngay</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Profile Header Banner */}
      <section className="bg-slate-950 text-white py-16 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{user.fullName}</h1>
              <p className="text-slate-400 font-medium">Thành viên từ {new Date().getFullYear()}</p>
            </div>
            <div className="md:ml-auto flex gap-4">
               <div className="bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 text-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Đơn hàng</p>
                  <p className="text-2xl font-black text-white">{orderCount}</p>
               </div>
               <div className="bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 text-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Yêu thích</p>
                  <p className="text-2xl font-black text-white">{wishlistCount}</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none rounded-[2.5rem] shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Thông tin tài khoản</CardTitle>
                  {!isEditing ? (
                    <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl" onClick={() => setIsEditing(true)}>
                       <Edit3 className="w-4 h-4 mr-2" /> Sửa thông tin
                    </Button>
                  ) : null}
               </CardHeader>
               <CardContent className="p-8">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Số điện thoại</Label>
                            <Input className="rounded-xl h-12" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Địa chỉ chính</Label>
                            <Input className="rounded-xl h-12" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                         </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <Button className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold" onClick={handleUpdateProfile}>Lưu thay đổi</Button>
                        <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setIsEditing(false)}>Hủy</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <div>
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Email</p>
                             <p className="font-bold text-slate-900 text-lg">{user.username}</p>
                          </div>
                          <div>
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Họ và tên</p>
                             <p className="font-bold text-slate-900 text-lg">{user.fullName}</p>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div>
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Số điện thoại</p>
                             <p className="font-bold text-slate-900 text-lg">{user.phone || 'Chưa cập nhật'}</p>
                          </div>
                          <div>
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Địa chỉ</p>
                             <p className="font-bold text-slate-900 text-lg">{user.address || 'Chưa cập nhật'}</p>
                          </div>
                       </div>
                    </div>
                  )}
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Link to="/orders">
                 <Card className="border-none rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white group p-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ShoppingBag className="w-7 h-7" />
                       </div>
                       <div className="flex-1">
                          <p className="font-black uppercase tracking-tighter text-slate-900 text-lg">Đơn hàng của tôi</p>
                          <p className="text-sm text-slate-500">Xem lại lịch sử mua sắm</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                 </Card>
               </Link>

               <Link to="/wishlist">
                 <Card className="border-none rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white group p-6">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <Heart className="w-7 h-7" />
                       </div>
                       <div className="flex-1">
                          <p className="font-black uppercase tracking-tighter text-slate-900 text-lg">Yêu thích</p>
                          <p className="text-sm text-slate-500">Danh sách các phím mơ ước</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-600 transition-colors" />
                    </div>
                 </Card>
               </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none rounded-3xl shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardContent className="p-8 space-y-4">
                   <Link to="/profile/addresses" className="block p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700 flex-1">Sổ địa chỉ</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                   </Link>
                   <Link to="/profile/password" className="block p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700 flex-1">Đổi mật khẩu</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                   </Link>
                   <div className="pt-4 mt-4 border-t border-slate-100">
                      <Button 
                        variant="ghost" 
                        loading={loading}
                        onClick={handleLogout}
                        className="w-full h-14 rounded-2xl text-red-500 hover:text-white hover:bg-red-500 bg-red-50 font-bold transition-all flex items-center justify-center gap-3 border-none"
                      >
                        <LogOut className="w-5 h-5" />
                        Đăng xuất
                      </Button>
                   </div>
                </CardContent>
            </Card>
            
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">Premium Member</h3>
               <p className="text-blue-100 text-sm leading-relaxed mb-6 relative z-10">Cảm ơn bạn đã đồng hành cùng GearFlow. Hãy khám phá những ưu đãi độc quyền dành riêng cho bạn.</p>
               <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold h-12 relative z-10">Khám phá ngay</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
