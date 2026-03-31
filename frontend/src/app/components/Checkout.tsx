import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { CreditCard, Wallet, ArrowLeft } from "lucide-react";

export function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'COD'>('VNPAY');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  });

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      navigate('/payment-result', { 
        state: { 
          success: true, 
          paymentMethod,
          orderId: 'ORD' + Date.now()
        } 
      });
    }, 1000);
  };

  const cartTotal = 4260000; // Mock total

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => step === 'payment' ? setStep('address') : navigate('/cart')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 'address' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              1
            </div>
            <span className="ml-3 font-semibold">Địa chỉ giao hàng</span>
          </div>
          
          <div className={`w-24 h-1 mx-4 ${step === 'payment' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className={`ml-3 font-semibold ${step === 'payment' ? '' : 'text-gray-400'}`}>
              Phương thức thanh toán
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {step === 'address' ? (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitAddress} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0901234567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Số nhà, tên đường"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Hà Nội"
                      />
                    </div>
                    <div>
                      <Label htmlFor="district">Quận/Huyện *</Label>
                      <Input
                        id="district"
                        required
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Cầu Giấy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ward">Phường/Xã *</Label>
                      <Input
                        id="ward"
                        required
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                        placeholder="Dịch Vọng"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Tiếp tục
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Phương thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="VNPAY" id="vnpay" />
                      <Label htmlFor="vnpay" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold">VNPAY</div>
                            <div className="text-sm text-gray-600">
                              Thanh toán qua ví điện tử, thẻ ATM, thẻ tín dụng
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="COD" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold">Thanh toán khi nhận hàng (COD)</div>
                            <div className="text-sm text-gray-600">
                              Thanh toán bằng tiền mặt khi nhận hàng
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Shipping Address Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Địa chỉ giao hàng</h3>
                    <p className="text-sm text-gray-600">
                      {formData.fullName} - {formData.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.address}, {formData.ward}, {formData.district}, {formData.city}
                    </p>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Hoàn tất đơn hàng
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>4,210,000đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>50,000đ</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">4,260,000đ</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">3 sản phẩm</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
