import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { CreditCard, Wallet, ArrowLeft, CheckCircle } from "lucide-react";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { toast } from "sonner";

export function Checkout() {
  const navigate = useNavigate();
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

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setCartLoading(true);
      const cart = await cartService.getCart();
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
      // 1. Create order with shipping info
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}`;
      
      const order = await orderService.createOrder({
        shippingAddress: fullAddress,
        shippingCity: formData.city,
        shippingPostalCode: '', // Optional field
        shippingPhone: formData.phone,
      });

      // 2. Create payment
      const payment = await paymentService.createPayment(order.id, paymentMethod);

      // 3. Handle payment method
      if (paymentMethod === 'VNPAY') {
        // Get VNPay URL and redirect
        const vnpayParams = await paymentService.getVNPayUrl(payment.id);
        const vnpayUrl = paymentService.buildVNPayUrl(vnpayParams);
        
        // Redirect to VNPay
        window.location.href = vnpayUrl;
      } else {
        // COD - redirect to success page
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
  const shipping = 50000;
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

      <h1 className="text-3xl font-bold mb-8 text-slate-900">Thanh toán</h1>

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
            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitAddress} className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="mb-1.5 block font-medium">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="mb-1.5 block font-medium">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0901234567"
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-1.5 block font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="mb-1.5 block font-medium">Địa chỉ cụ thể *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Số nhà, tên đường"
                      className="rounded-xl h-11"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="mb-1.5 block font-medium">Tỉnh/TP *</Label>
                      <Input id="city" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Hà Nội" className="rounded-xl h-11" />
                    </div>
                    <div>
                      <Label htmlFor="district" className="mb-1.5 block font-medium">Quận/Huyện *</Label>
                      <Input id="district" required value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder="Cầu Giấy" className="rounded-xl h-11" />
                    </div>
                    <div>
                      <Label htmlFor="ward" className="mb-1.5 block font-medium">Phường/Xã *</Label>
                      <Input id="ward" required value={formData.ward} onChange={e => setFormData({ ...formData, ward: e.target.value })} placeholder="Dịch Vọng" className="rounded-xl h-11" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-base" size="lg">
                    Tiếp tục → Chọn thanh toán
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmitPayment} className="space-y-5">
                  <RadioGroup value={paymentMethod} onValueChange={v => setPaymentMethod(v as 'VNPAY' | 'COD')}>
                    <div className={`flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'VNPAY' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <RadioGroupItem value="VNPAY" id="vnpay" className="mt-1" />
                      <Label htmlFor="vnpay" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">VNPAY</div>
                            <div className="text-sm text-slate-500 mt-0.5">
                              Ví điện tử, thẻ ATM, thẻ tín dụng/ghi nợ
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === 'COD' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <RadioGroupItem value="COD" id="cod" className="mt-1" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</div>
                            <div className="text-sm text-slate-500 mt-0.5">
                              Thanh toán bằng tiền mặt khi nhận hàng
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Address Summary */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <h3 className="font-semibold text-slate-900 mb-2 text-sm">📍 Địa chỉ giao hàng</h3>
                    <p className="text-sm font-medium text-slate-800">{formData.fullName} · {formData.phone}</p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {formData.address}, {formData.ward}, {formData.district}, {formData.city}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-base font-semibold"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                      </div>
                    ) : (
                      'Hoàn tất đơn hàng'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 rounded-2xl border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-slate-900">{shipping.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-3 flex justify-between text-lg font-bold">
                  <span className="text-slate-900">Tổng cộng</span>
                  <span className="text-indigo-600">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 text-center">{itemCount} sản phẩm</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
