import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { CreditCard, Wallet, ArrowLeft, Plus, MapPin, CheckCircle2, ShoppingBag } from "lucide-react";
import { cartApi, orderApi, paymentApi, shippingApi } from "../services/api";
import type { ShippingAddressDTO, CartDTO } from "../types";
import { toast } from "sonner";

export function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'COD'>('VNPAY');
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddressDTO[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cartData, addressesData] = await Promise.all([
        cartApi.getCart(),
        shippingApi.getShippingAddresses()
      ]);
      
      setCart(cartData);
      setAddresses(addressesData);
      
      const defaultAddress = addressesData.find(a => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id!);
        setFormData({
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          email: defaultAddress.email || '',
          address: defaultAddress.address,
          city: defaultAddress.city,
          district: defaultAddress.district,
          ward: defaultAddress.ward,
        });
      } else if (addressesData.length === 0) {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const handleSelectAddress = (address: ShippingAddressDTO) => {
    setSelectedAddressId(address.id!);
    setShowNewAddressForm(false);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      email: address.email || '',
      address: address.address,
      city: address.city,
      district: address.district,
      ward: address.ward,
    });
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId && !showNewAddressForm) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    setStep('payment');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    if (!formData.address || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      setStep('address');
      return;
    }
    try {
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}`;
      const orderData = {
        shippingAddress: fullAddress,
        shippingCity: formData.city,
        shippingPostalCode: '',
        shippingPhone: formData.phone,
      };
      const order = await orderApi.createOrder(orderData);
      const payment = await paymentApi.createPayment(order.id, paymentMethod);
      if (paymentMethod === 'VNPAY') {
        const vnpayParams = await paymentApi.getPaymentVnpayUrl(payment.id);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = vnpayParams.vnp_ApiUrl;
        form.style.display = 'none';
        Object.entries(vnpayParams).forEach(([key, value]) => {
          if (key !== 'vnp_ApiUrl' && key !== 'url') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          }
        });
        document.body.appendChild(form);
        setTimeout(() => { form.submit(); }, 50);
      } else {
        toast.success('Đặt hàng thành công!');
        navigate('/payment-result', { state: { success: true, paymentMethod: 'COD', orderId: order.id } });
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  const shipping = 50000;
  const total = (cart?.totalPrice || 0) + shipping;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Checkout Header Banner */}
      <section className="bg-slate-950 text-white py-16 relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase text-white">THANH TOÁN</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Hoàn tất đơn hàng của bạn chỉ với vài bước đơn giản.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Checkout Section */}
          <div className="flex-1 space-y-8">
            {/* Progress Bar */}
            <div className="flex items-center justify-between px-4">
              <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setStep('address')}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step === 'address' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-green-500 text-white'
                }`}>
                  {step === 'payment' ? <CheckCircle2 className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${step === 'address' ? 'text-blue-600' : 'text-slate-400'}`}>Địa chỉ</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 mx-4 relative overflow-hidden">
                <div className={`absolute inset-0 bg-blue-600 transition-transform duration-500 origin-left ${step === 'payment' ? 'scale-x-100' : 'scale-x-0'}`} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step === 'payment' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-200 text-slate-400'
                }`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${step === 'payment' ? 'text-blue-600' : 'text-slate-400'}`}>Thanh toán</span>
              </div>
            </div>

            {step === 'address' ? (
              <Card className="border-none rounded-3xl shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Thông tin giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {addresses.length > 0 && !showNewAddressForm && (
                    <div className="mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(address => (
                          <div
                            key={address.id}
                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 relative group ${
                              selectedAddressId === address.id
                                ? 'border-blue-600 bg-blue-50/50'
                                : 'border-slate-100 hover:border-blue-200 bg-white'
                            }`}
                            onClick={() => handleSelectAddress(address)}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-lg">{address.fullName}</span>
                                {address.isDefault && (
                                  <span className="text-[10px] uppercase font-black tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded">Mặc định</span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-slate-600">{address.phone}</p>
                              <p className="text-sm text-slate-500 leading-relaxed">
                                {address.address}, {address.ward}, {address.district}, {address.city}
                              </p>
                            </div>
                            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAddressId === address.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white'
                            }`}>
                              {selectedAddressId === address.id && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => { setShowNewAddressForm(true); setSelectedAddressId(null); }}
                          className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 group"
                        >
                          <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          <span className="font-bold uppercase tracking-widest text-[11px]">Thêm địa chỉ mới</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {(showNewAddressForm || addresses.length === 0) && (
                    <form onSubmit={handleSubmitAddress} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-black text-slate-500 tracking-widest ml-1">Họ và tên *</Label>
                          <Input className="rounded-xl h-12 border-slate-200 focus:ring-blue-500/20" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-black text-slate-500 tracking-widest ml-1">Số điện thoại *</Label>
                          <Input className="rounded-xl h-12 border-slate-200 focus:ring-blue-500/20" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-black text-slate-500 tracking-widest ml-1">Địa chỉ cụ thể *</Label>
                        <Input className="rounded-xl h-12 border-slate-200 focus:ring-blue-500/20" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-black text-slate-500 tracking-widest ml-1">Tỉnh/Thành phố *</Label>
                          <Input className="rounded-xl h-12 border-slate-200 focus:ring-blue-500/20" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-black text-slate-500 tracking-widest ml-1">Quận/Huyện *</Label>
                          <Input className="rounded-xl h-12 border-slate-200 focus:ring-blue-500/20" required value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase font-black text-slate-500 tracking-widest ml-1">Phường/Xã *</Label>
                          <Input className="rounded-xl h-12 border-slate-200 focus:ring-blue-500/20" required value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        {addresses.length > 0 && (
                          <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-slate-200" onClick={() => setShowNewAddressForm(false)}>Hủy</Button>
                        )}
                        <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/30">Tiếp tục</Button>
                      </div>
                    </form>
                  )}

                  {!showNewAddressForm && addresses.length > 0 && selectedAddressId && (
                    <Button onClick={handleSubmitAddress} className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/30">Tiếp tục thanh toán</Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none rounded-3xl shadow-xl shadow-slate-200 bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmitPayment} className="space-y-8">
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div onClick={() => setPaymentMethod('VNPAY')} className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                        paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'
                      }`}>
                        <RadioGroupItem value="VNPAY" id="vnpay" className="sr-only" />
                        <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                          <CreditCard className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">VNPAY</p>
                          <p className="text-xs text-slate-500">Ví điện tử & ATM</p>
                        </div>
                        {paymentMethod === 'VNPAY' && <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto" />}
                      </div>

                      <div onClick={() => setPaymentMethod('COD')} className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                        paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'border-slate-100 bg-white hover:border-green-200'
                      }`}>
                        <RadioGroupItem value="COD" id="cod" className="sr-only" />
                        <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20">
                          <Wallet className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Tiền mặt (COD)</p>
                          <p className="text-xs text-slate-500">Thanh toán khi nhận</p>
                        </div>
                        {paymentMethod === 'COD' && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
                      </div>
                    </RadioGroup>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Địa chỉ nhận hàng</h4>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-bold text-slate-800">{formData.fullName} - {formData.phone}</p>
                          <p className="text-sm text-slate-500 leading-relaxed">{formData.address}, {formData.ward}, {formData.district}, {formData.city}</p>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg uppercase tracking-widest shadow-2xl shadow-blue-500/40 transform transition-transform hover:scale-[1.02]">
                      Thanh toán {total.toLocaleString('vi-VN')}đ
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Order Summary */}
          <aside className="lg:w-96">
            <Card className="border-none rounded-3xl shadow-xl shadow-slate-200 bg-white overflow-hidden sticky top-24">
              <CardHeader className="bg-slate-900 p-6 text-white text-center">
                <CardTitle className="text-lg font-black tracking-widest uppercase mb-0">Hóa đơn</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                  {cart?.items.map(item => (
                    <div key={item.variantId} className="flex gap-4 group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                        <img src={item.imageUrl || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.productName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.variantDetails}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-slate-400">x{item.quantity}</span>
                          <span className="text-sm font-black text-slate-900">{item.subtotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Tạm tính</span>
                    <span className="font-bold text-slate-900">{(cart?.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Vận chuyển</span>
                    <span className="font-bold text-slate-900">{shipping.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền</span>
                      <p className="text-2xl font-black text-blue-600 tracking-tighter">{total.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 text-center">
                  <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-tighter">Bảo mật giao dịch</p>
                  <p className="text-[9px] text-yellow-600 mt-1">Mọi giao dịch của bạn đều được mã hóa và bảo mật tuyệt đối bởi hệ thống thanh toán chính chủ.</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
