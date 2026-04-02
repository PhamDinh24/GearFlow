import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { CreditCard, Wallet, ArrowLeft, Plus, MapPin } from "lucide-react";
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
      
      // Auto-select default address
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
    
    // Validate form data
    if (!formData.address || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      setStep('address');
      return;
    }
    
    try {
      // Create order with full address
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}`;
      const orderData = {
        shippingAddress: fullAddress,
        shippingCity: formData.city,
        shippingPostalCode: '',
        shippingPhone: formData.phone,
      };
      
      console.log('Creating order with data:', orderData);
      const order = await orderApi.createOrder(orderData);
      console.log('Order created:', order);
      
      // Create payment
      console.log('Creating payment for order:', order.id, 'method:', paymentMethod);
      const payment = await paymentApi.createPayment(order.id, paymentMethod);
      console.log('Payment created:', payment);
      
      if (paymentMethod === 'VNPAY') {
        const vnpayParams = await paymentApi.getPaymentVnpayUrl(payment.id);
        console.log('VNPay params received:', vnpayParams);
        
        // Create and submit form to VNPay
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = vnpayParams.vnp_ApiUrl;
        form.style.display = 'none'; // Hide form from UI
        
        // Add all parameters as hidden fields (except apiUrl and url)
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
        
        // Submit form with slight delay to ensure DOM is settled
        setTimeout(() => {
          form.submit();
        }, 50);
      } else {
        // COD - redirect to success page
        toast.success('Đặt hàng thành công!');
        navigate('/payment-result', { 
          state: { 
            success: true, 
            paymentMethod: 'COD',
            orderId: order.id
          } 
        });
      }
    } catch (error: any) {
      console.error('Order/Payment error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  const shipping = 50000;
  const total = (cart?.totalPrice || 0) + shipping;

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
                {/* Saved Addresses */}
                {addresses.length > 0 && !showNewAddressForm && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Chọn địa chỉ có sẵn</h3>
                    <div className="space-y-2">
                      {addresses.map(address => (
                        <div
                          key={address.id}
                          className={`p-4 border rounded-lg cursor-pointer transition ${
                            selectedAddressId === address.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:border-gray-400'
                          }`}
                          onClick={() => handleSelectAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{address.fullName}</span>
                                {address.isDefault && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                              <p className="text-sm text-gray-600">
                                {address.address}, {address.ward}, {address.district}, {address.city}
                              </p>
                            </div>
                            <input
                              type="radio"
                              checked={selectedAddressId === address.id}
                              onChange={() => handleSelectAddress(address)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        setShowNewAddressForm(true);
                        setSelectedAddressId(null);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                )}

                {/* New Address Form */}
                {(showNewAddressForm || addresses.length === 0) && (
                  <form onSubmit={handleSubmitAddress} className="space-y-4">
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewAddressForm(false);
                          const defaultAddr = addresses.find(a => a.isDefault);
                          if (defaultAddr) {
                            handleSelectAddress(defaultAddr);
                          }
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại chọn địa chỉ có sẵn
                      </Button>
                    )}
                    
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
                )}

                {/* Continue button for saved address */}
                {!showNewAddressForm && addresses.length > 0 && selectedAddressId && (
                  <Button 
                    onClick={handleSubmitAddress} 
                    className="w-full" 
                    size="lg"
                  >
                    Tiếp tục
                  </Button>
                )}
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
              {/* Product List */}
              {cart && cart.items && cart.items.length > 0 && (
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-semibold mb-3 text-sm">Sản phẩm ({cart.totalItems})</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.items.map(item => (
                      <div key={item.variantId} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.productName}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.productName}</p>
                          {item.variantDetails && (
                            <p className="text-xs text-gray-500 truncate">{item.variantDetails}</p>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                            <span className="text-sm font-semibold text-blue-600">
                              {item.subtotal.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>{(cart?.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>{shipping.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
