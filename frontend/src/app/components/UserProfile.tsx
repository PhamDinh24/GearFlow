import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "./ui/dialog";
import {
  User, ShoppingBag, Heart, Lock, LogOut, MapPin, Mail, Phone,
  Calendar, Edit, Save, X, Plus, Trash2, Star,
} from "lucide-react";
import { toast } from "sonner";
import { shippingApi } from "../services/api";
import type { ShippingAddressDTO } from "../types";

export function UserProfile() {
  const { user, isLoggedIn, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
  });

  // Address state
  const [addresses, setAddresses] = useState<ShippingAddressDTO[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddressDTO | null>(null);
  const [addressForm, setAddressForm] = useState<ShippingAddressDTO>({
    fullName: '', phone: '', email: '', address: '',
    ward: '', district: '', city: '', postalCode: '', isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    if (isLoggedIn) loadAddresses();
  }, [isLoggedIn]);

  const loadAddresses = async () => {
    try {
      setAddressLoading(true);
      const data = await shippingApi.getShippingAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleProfileSave = () => {
    updateUser({ phone: profileForm.phone });
    setIsEditing(false);
    toast.success('Đã cập nhật thông tin');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Đã đăng xuất');
  };

  const openAddressDialog = (address?: ShippingAddressDTO) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({ ...address });
    } else {
      setEditingAddress(null);
      setAddressForm({
        fullName: user?.username || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '', ward: '', district: '', city: '', postalCode: '',
        isDefault: addresses.length === 0,
      });
    }
    setShowAddressDialog(true);
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.address ||
        !addressForm.city || !addressForm.district || !addressForm.ward) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      setAddressSaving(true);
      if (editingAddress?.id) {
        await shippingApi.updateShippingAddress(editingAddress.id, addressForm);
        toast.success('Đã cập nhật địa chỉ');
      } else {
        await shippingApi.createShippingAddress(addressForm);
        toast.success('Đã thêm địa chỉ mới');
      }
      setShowAddressDialog(false);
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Không thể lưu địa chỉ');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await shippingApi.deleteShippingAddress(id);
      toast.success('Đã xóa địa chỉ');
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await shippingApi.setDefaultShippingAddress(id);
      toast.success('Đã đặt làm địa chỉ mặc định');
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Không thể đặt mặc định');
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Vui lòng đăng nhập</h2>
          <p className="text-slate-500 mb-6">Bạn cần đăng nhập để xem thông tin tài khoản</p>
          <Link to="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8">Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  const defaultAddress = addresses.find(a => a.isDefault);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-10 text-slate-900">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile + Addresses */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Info */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h2>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setProfileForm({ phone: user.phone || '' }); }} className="rounded-xl gap-2">
                    <Edit className="w-4 h-4" /> Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleProfileSave} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                      <Save className="w-4 h-4" /> Lưu
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-6">
                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-3xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{user.username}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {user.role === 'admin' ? '⚙️ Quản trị viên' : '👤 Khách hàng'}
                    </span>
                  </div>
                </div>

                <div className="space-y-0">
                  {/* Username - read only */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-100">
                    <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-0.5">Tên đăng nhập</p>
                      <p className="font-semibold text-slate-900">{user.username}</p>
                    </div>
                  </div>

                  {/* Email - read only */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-100">
                    <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-0.5">Email</p>
                      <p className="font-semibold text-slate-900">{user.email || 'Chưa cập nhật'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Email không thể thay đổi</p>
                    </div>
                  </div>

                  {/* Phone - editable */}
                  <div className="flex items-center gap-4 py-4 border-b border-slate-100">
                    <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-0.5">Số điện thoại</p>
                      {isEditing ? (
                        <Input
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="rounded-xl h-9 mt-1"
                          placeholder="0901 234 567"
                        />
                      ) : (
                        <p className="font-semibold text-slate-900">{user.phone || 'Chưa cập nhật'}</p>
                      )}
                    </div>
                  </div>

                  {/* Join date - read only */}
                  <div className="flex items-center gap-4 py-4">
                    <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Ngày tham gia</p>
                      <p className="font-semibold text-slate-900">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Addresses */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Địa chỉ giao hàng</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{addresses.length} địa chỉ đã lưu</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => openAddressDialog()}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2"
                >
                  <Plus className="w-4 h-4" /> Thêm địa chỉ
                </Button>
              </div>
              <div className="p-6">
                {addressLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                    <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">Chưa có địa chỉ giao hàng nào</p>
                    <Button variant="outline" onClick={() => openAddressDialog()} className="rounded-xl gap-2">
                      <Plus className="w-4 h-4" /> Thêm địa chỉ đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        className={`border-2 rounded-xl p-4 transition-colors ${
                          addr.isDefault ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              addr.isDefault ? 'bg-indigo-100' : 'bg-slate-100'
                            }`}>
                              <MapPin className={`w-4 h-4 ${addr.isDefault ? 'text-indigo-600' : 'text-slate-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold text-slate-900">{addr.fullName}</span>
                                <span className="text-slate-500 text-sm">·</span>
                                <span className="text-slate-600 text-sm">{addr.phone}</span>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                                {addr.postalCode && ` ${addr.postalCode}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!addr.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefault(addr.id!)}
                                className="rounded-lg text-xs text-indigo-600 hover:bg-indigo-50 h-8 px-2"
                                title="Đặt làm mặc định"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAddressDialog(addr)}
                              className="rounded-lg hover:bg-slate-100 h-8 w-8 p-0"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(addr.id!)}
                              className="rounded-lg hover:bg-red-50 text-red-500 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="space-y-5">
            {/* Quick nav */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Điều hướng nhanh</h3>
              </div>
              <div className="p-3 space-y-1">
                <Link to="/orders">
                  <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-slate-100 gap-3">
                    <ShoppingBag className="w-4 h-4 text-slate-500" />
                    <span>Đơn hàng của tôi</span>
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-slate-100 gap-3">
                    <Heart className="w-4 h-4 text-slate-500" />
                    <span>Sản phẩm yêu thích</span>
                  </Button>
                </Link>
                <Link to="/change-password">
                  <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-slate-100 gap-3">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Đổi mật khẩu</span>
                  </Button>
                </Link>
                <div className="pt-2 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl gap-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Default address summary */}
            {defaultAddress && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Địa chỉ mặc định</h3>
                </div>
                <p className="font-semibold text-slate-900 text-sm">{defaultAddress.fullName}</p>
                <p className="text-slate-600 text-xs mt-1">{defaultAddress.phone}</p>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {defaultAddress.address}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}
                </p>
              </div>
            )}

            {/* Member card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">Thẻ thành viên</span>
              </div>
              <p className="text-2xl font-bold mb-1">{user.username}</p>
              <p className="text-sm opacity-80 mb-1">Thành viên từ</p>
              <p className="font-bold text-sm">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
              {user.email && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs opacity-70 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={open => { setShowAddressDialog(open); if (!open) setEditingAddress(null); }}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
            <DialogDescription>Nhập thông tin địa chỉ giao hàng</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddressSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Họ và tên *</Label>
                <Input
                  required
                  value={addressForm.fullName}
                  onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="rounded-xl"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Số điện thoại *</Label>
                <Input
                  required
                  type="tel"
                  value={addressForm.phone}
                  onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="rounded-xl"
                  placeholder="0901234567"
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Địa chỉ cụ thể *</Label>
              <Input
                required
                value={addressForm.address}
                onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                className="rounded-xl"
                placeholder="Số nhà, tên đường"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Tỉnh/TP *</Label>
                <Input
                  required
                  value={addressForm.city}
                  onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="rounded-xl"
                  placeholder="Hà Nội"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Quận/Huyện *</Label>
                <Input
                  required
                  value={addressForm.district}
                  onChange={e => setAddressForm({ ...addressForm, district: e.target.value })}
                  className="rounded-xl"
                  placeholder="Cầu Giấy"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Phường/Xã *</Label>
                <Input
                  required
                  value={addressForm.ward}
                  onChange={e => setAddressForm({ ...addressForm, ward: e.target.value })}
                  className="rounded-xl"
                  placeholder="Dịch Vọng"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
              <input
                type="checkbox"
                id="isDefault"
                checked={!!addressForm.isDefault}
                onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <Label htmlFor="isDefault" className="cursor-pointer text-sm font-medium text-slate-700">
                Đặt làm địa chỉ mặc định
              </Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddressDialog(false)} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" disabled={addressSaving} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                {addressSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </div>
                ) : editingAddress ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
