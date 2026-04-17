import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { cartApi } from "../services/api";
import type { CartDTO } from "../types";
import { toast } from "sonner";

export function Cart() {
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const updatedCart = await cartApi.updateCartItem(variantId, newQuantity);
      setCart(updatedCart);
      toast.success('Đã cập nhật số lượng');
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      const updatedCart = await cartApi.removeFromCart(variantId);
      setCart(updatedCart);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
        <section className="bg-slate-950 text-white py-16 relative overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">GIỎ HÀNG</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Giỏ hàng của bạn hiện đang trống.</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-20 border-none rounded-3xl shadow-xl shadow-slate-200">
            <CardContent>
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform hover:scale-110">
                <ShoppingBag className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Bạn chưa chọn được phím ưng ý?</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Khám phá hàng trăm mẫu bàn phím cơ và linh kiện cao cấp đang chờ đón bạn.</p>
              <Link to="/shop">
                <Button size="lg" className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl px-10 h-14 font-bold transition-all shadow-lg shadow-slate-200">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const shipping = 50000;
  const total = cart.totalPrice + shipping;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Cart Header Banner */}
      <section className="bg-slate-950 text-white py-16 relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">GIỎ HÀNG</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Bạn đang có {cart.items.length} mặt hàng trong giỏ hàng.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map(item => (
              <Card key={item.variantId} className="border-none rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative group">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.productName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                        <h3 className="font-bold text-xl text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                          {item.productName}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.variantId)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full w-10 h-10 flex border-none bg-transparent self-end sm:self-auto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      {item.variantDetails && (
                        <p className="text-sm font-medium text-slate-500 mb-3 bg-slate-50 px-3 py-1 rounded-full inline-block">
                          {item.variantDetails}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg hover:bg-white text-slate-500"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-10 text-center font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg hover:bg-white text-slate-500"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter mb-0.5">Giá đơn vị</p>
                          <p className="text-lg font-bold text-slate-900">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter mb-0.5">Thành tiền</p>
                          <p className="text-lg font-black text-blue-600">
                            {item.subtotal.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none rounded-3xl shadow-xl shadow-slate-200 overflow-hidden bg-white">
              <div className="bg-slate-900 p-6 text-white text-center">
                <h2 className="text-xl font-black tracking-widest uppercase">Tóm tắt đơn hàng</h2>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-sm font-medium">Tạm tính:</span>
                    <span className="font-bold text-slate-900">{cart.totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">Phí vận chuyển:</span>
                    </div>
                    <span className="font-bold text-slate-900">{shipping.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                    <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Tổng cộng</span>
                    <span className="text-3xl font-black text-blue-600 tracking-tighter leading-none">
                      {total.toLocaleString('vi-VN')}<span className="text-sm ml-0.5 align-top">đ</span>
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-8 font-black text-lg shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02]" 
                  onClick={handleCheckout}
                >
                  Thanh Toán Ngay
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1" />
                </Button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-50 p-4 rounded-xl leading-relaxed">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    Đơn hàng của bạn đủ điều kiện nhận ưu đãi đặc biệt trong tháng này.
                  </div>
                  
                  <Link to="/shop" className="block text-center">
                    <Button variant="ghost" className="text-slate-500 hover:text-blue-600 font-bold w-full rounded-xl">
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
