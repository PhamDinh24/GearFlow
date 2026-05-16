import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { CreditCard, Wallet, ArrowLeft, CheckCircle, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { shippingAddressService, type ShippingAddress } from "../services/shippingAddressService";
import { toast } from "sonner";

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'COD'>('VNPAY');
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState<any>(null);
  const [cartLoading, setCartLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  });

  const { isLoggedIn, user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);

  useEffect(() => {
    loadCart();
    if (isLoggedIn) {
      loadSavedAddresses();
    }
  }, [isLoggedIn]);

  const loadSavedAddresses = async () => {
    try {
      const addresses = await shippingAddressService.getAddresses();
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handleAutoFill = () => {
    const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
    if (defaultAddr) {
      setFormData({
        fullName: defaultAddr.fullName,
        phone: defaultAddr.phone,
        email: defaultAddr.email || '',
        address: defaultAddr.address,
        city: defaultAddr.city,
        district: defaultAddr.district,
        ward: defaultAddr.ward,
      });
      toast.success('Đã tự động điền địa chỉ mặc định');
    } else {
      toast.error('Không tìm thấy địa chỉ đã lưu');
    }
  };

  const loadCart = async () => {
    try {
      setCartLoading(true);
      const cart = await cartService.getCart();
      
      // Filter items if selectedVariantIds is provided
      const selectedVariantIds = location.state?.selectedVariantIds as string[] | undefined;
      if (selectedVariantIds && selectedVariantIds.length > 0) {
        cart.items = cart.items.filter(item => selectedVariantIds.includes(item.variantId));
        // Recalculate total price for filtered items
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cart.totalItems = cart.items.length;
      }
      
      setCartData(cart);
      
      if (!cart.items || cart.items.length === 0) {
        toast.error('Giỏ hàng trống');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Không thể tải giỏ hàng');
      navigate('/cart');
    } finally {
      setCartLoading(false);
    }
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order with all detailed fields
      const order = await orderService.createOrder({
        shippingFullName: formData.fullName,
        shippingEmail: formData.email,
        shippingPhone: formData.phone,
        shippingAddress: formData.address,
        shippingWard: formData.ward,
        shippingDistrict: formData.district,
        shippingCity: formData.city,
      });

      // 2. Create payment
      const payment = await paymentService.createPayment(order.id, paymentMethod);

      // 3. Handle payment method
      if (paymentMethod === 'VNPAY') {
        const vnpayParams = await paymentService.getVNPayUrl(payment.id);
        const vnpayUrl = paymentService.buildVNPayUrl(vnpayParams);
        window.location.href = vnpayUrl;
      } else {
        navigate('/payment-result', {
          state: {
            success: true,
            paymentMethod: 'COD',
            orderId: order.id,
          },
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-center items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const subtotal = cartData?.totalPrice || 0;
  const shipping = 30000;
  const total = subtotal + shipping;
  const itemCount = cartData?.items?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => step === 'payment' ? setStep('address') : navigate('/cart')}
          className="rounded-xl hover:bg-slate-100 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Thanh toán</h1>
        {isLoggedIn && step === 'address' && savedAddresses.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoFill}
            className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Sử dụng địa chỉ đã lưu
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              step === 'address' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-emerald-500 text-white'
            }`}>
              {step === 'payment' ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className={`font-semibold ${step === 'address' ? 'text-indigo-600' : 'text-slate-600'}`}>
              Địa chỉ giao hàng
            </span>
          </div>

          <div className={`w-24 h-1.5 mx-4 rounded-full transition-colors ${step === 'payment' ? 'bg-indigo-600' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              step === 'payment' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-500'
            }`}>
              2
            </div>
            <span className={`font-semibold ${step === 'payment' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Thanh toán
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {step === 'address' ? (
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg">Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitAddress} className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="mb-1.5 block font-semibold text-slate-700 text-sm">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="rounded-xl h-12 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="mb-1.5 block font-semibold text-slate-700 text-sm">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0901234567"
                        className="rounded-xl h-12 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-1.5 block font-semibold text-slate-700 text-sm">Email (Không bắt buộc)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="rounded-xl h-12 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="mb-1.5 block font-semibold text-slate-700 text-sm">Địa chỉ cụ thể *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Số nhà, tên đường"
                      className="rounded-xl h-12 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="mb-1.5 block font-semibold text-slate-700 text-sm">Tỉnh/TP *</Label>
                      <Input id="city" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Hà Nội" className="rounded-xl h-12" />
                    </div>
                    <div>
                      <Label htmlFor="district" className="mb-1.5 block font-semibold text-slate-700 text-sm">Quận/Huyện *</Label>
                      <Input id="district" required value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder="Cầu Giấy" className="rounded-xl h-12" />
                    </div>
                    <div>
                      <Label htmlFor="ward" className="mb-1.5 block font-semibold text-slate-700 text-sm">Phường/Xã *</Label>
                      <Input id="ward" required value={formData.ward} onChange={e => setFormData({ ...formData, ward: e.target.value })} placeholder="Dịch Vọng" className="rounded-xl h-12" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-base font-bold shadow-lg shadow-indigo-100" size="lg">
                    Tiếp tục → Chọn thanh toán
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg">Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as 'VNPAY' | 'COD')}>
                    <div className={`flex items-start space-x-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === 'VNPAY' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                    }`}>
                      <RadioGroupItem value="VNPAY" id="vnpay" className="mt-1" />
                      <Label htmlFor="vnpay" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">Thanh toán VNPAY</div>
                            <div className="text-xs text-slate-500 mt-1">
                              ATM, Visa, Master, JCB hoặc QR Pay
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-start space-x-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                    }`}>
                      <RadioGroupItem value="COD" id="cod" className="mt-1" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</div>
                            <div className="text-xs text-slate-500 mt-1">
                              Kiểm tra hàng trước khi thanh toán
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Address Summary */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                    <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      Địa chỉ nhận hàng
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-slate-800">{formData.fullName} · <span className="font-medium text-slate-600">{formData.phone}</span></p>
                      <p className="text-slate-500 leading-relaxed">
                        {formData.address}, {formData.ward}, {formData.district}, {formData.city}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-bold shadow-lg shadow-indigo-100"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </div>
                    ) : (
                      `Hoàn tất đặt hàng · ${total.toLocaleString('vi-VN')}đ`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <CardTitle className="text-base font-bold">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4 mb-6">
                {cartData?.items?.map((item: any) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.productName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-slate-500">x{item.quantity}</span>
                        <span className="text-xs font-bold text-slate-700">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-slate-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-slate-900">{shipping.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Tổng cộng</span>
                  <span className="text-xl font-black text-indigo-600">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
}
