import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { MapPin, Plus, Edit3, Trash2, CheckCircle2, MoreVertical, Star, ArrowLeft } from "lucide-react";
import { shippingApi } from "../../services/api";
import type { ShippingAddressDTO } from "../../types";
import { toast } from "sonner";
import { Link } from "react-router";

export function ShippingAddresses() {
  const [addresses, setAddresses] = useState<ShippingAddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddressDTO | null>(null);
  const [formData, setFormData] = useState<ShippingAddressDTO>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await shippingApi.getShippingAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (address?: ShippingAddressDTO) => {
    if (address) {
      setEditingAddress(address);
      setFormData({ ...address });
    } else {
      setEditingAddress(null);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        ward: '',
        district: '',
        city: '',
        postalCode: '',
        isDefault: addresses.length === 0,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await shippingApi.updateShippingAddress(editingAddress.id!, formData);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await shippingApi.createShippingAddress(formData);
        toast.success('Thêm địa chỉ mới thành công');
      }
      handleCloseDialog();
      loadAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await shippingApi.deleteShippingAddress(id);
      toast.success('Đã xóa địa chỉ');
      loadAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await shippingApi.setDefaultShippingAddress(id);
      toast.success('Đã đặt làm địa chỉ mặc định');
      loadAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Không thể đặt địa chỉ mặc định');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <section className="bg-slate-950 text-white py-14 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/profile" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại hồ sơ</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">SỔ ĐỊA CHỈ</h1>
              <p className="text-slate-400 font-medium">Quản lý các điểm đến tin cậy của bạn.</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold px-8 shadow-xl shadow-white/5">
              <Plus className="w-5 h-5 mr-2" /> Thêm địa chỉ mới
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {addresses.length === 0 ? (
          <Card className="text-center py-24 border-none rounded-[3rem] shadow-xl shadow-slate-200 bg-white">
            <CardContent>
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-slate-200" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Danh sách địa chỉ trống</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Thêm địa chỉ giao hàng để quy trình đặt hàng trở nên nhanh chóng và tiện lợi hơn.</p>
              <Button onClick={() => handleOpenDialog()} className="bg-slate-900 text-white rounded-xl px-10 h-14 font-bold shadow-lg shadow-slate-200">
                Thêm địa chỉ ngay
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  onClick={() => handleOpenDialog(address)}
                  className={`border-2 rounded-[2.5rem] p-8 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    address.isDefault 
                      ? 'border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-500/5' 
                      : 'border-white bg-white hover:border-blue-100 hover:shadow-xl'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${address.isDefault ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors'}`}>
                        <MapPin className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-black uppercase tracking-tighter text-slate-900 text-xl">{address.fullName}</h3>
                        {address.isDefault && (
                          <span className="text-[10px] uppercase font-black tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full mt-1.5 inline-block">Mặc định</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-slate-200" onClick={(e) => { e.stopPropagation(); handleOpenDialog(address); }}>
                          <Edit3 className="w-5 h-5 text-slate-600" />
                       </Button>
                       {!address.isDefault && (
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-red-50" onClick={(e) => handleDelete(address.id!, e)}>
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </Button>
                       )}
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-slate-100/50">
                    <div className="flex items-center gap-3 text-slate-900">
                       <div className="w-6 text-slate-300 font-bold text-xs uppercase tracking-tighter">Tel</div>
                       <span className="font-bold">{address.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-600">
                       <div className="w-6 text-slate-300 font-bold text-xs uppercase tracking-tighter pt-1">Adr</div>
                       <p className="text-sm font-medium leading-relaxed">{address.address}, {address.ward}, {address.district}, {address.city}</p>
                    </div>
                  </div>

                  {!address.isDefault && (
                    <Button 
                      variant="ghost" 
                      onClick={(e) => handleSetDefault(address.id!, e)}
                      className="w-full mt-8 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl font-bold h-12 transition-all opacity-0 group-hover:opacity-100"
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl p-0 border-none rounded-[3rem] overflow-hidden bg-white shadow-2xl">
          <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent z-0" />
             <div className="relative z-10 flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center"><MapPin className="w-7 h-7" /></div>
                <div>
                   <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                      {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                   </DialogTitle>
                   <DialogDescription className="text-slate-400 font-medium">Nhập thông tin giao hàng chi tiết bên dưới.</DialogDescription>
                </div>
             </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên *</Label>
                <Input required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="rounded-xl h-12 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Số điện thoại *</Label>
                <Input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="rounded-xl h-12 border-slate-100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ cụ thể *</Label>
              <Input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="rounded-xl h-12 border-slate-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tỉnh/Thành phố *</Label>
                <Input required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="rounded-xl h-12 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Quận/Huyện *</Label>
                <Input required value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="rounded-xl h-12 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phường/Xã *</Label>
                <Input required value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} className="rounded-xl h-12 border-slate-100" />
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-5 h-5 rounded-lg text-blue-600 border-slate-200"
              />
              <Label htmlFor="isDefault" className="font-bold text-slate-700 cursor-pointer">
                Đặt làm địa chỉ nhận hàng mặc định
              </Label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-50">
              <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
                {editingAddress ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1 h-14 rounded-2xl font-bold">
                Hủy
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
