import { useState, useEffect } from "react";
import { Link } from "react-router";
import { cartService } from "../services/cartService";
import { Button } from "./ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantDetails: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

export function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = await cartService.getCart();
      setCartItems(cart.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (newQuantity > item.stock) {
      toast.error(`Chỉ còn ${item.stock} sản phẩm trong kho`);
      return;
    }
    
    try {
      await cartService.updateCartItem(item.variantId, newQuantity);
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const item = cartItems.find(i => i.id === itemId);
      if (!item) return;
      
      await cartService.removeCartItem(item.variantId);
      setCartItems(items => items.filter(item => item.id !== itemId));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50000;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl text-center py-20">
            <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-slate-900">Giỏ hàng trống</h2>
            <p className="text-slate-600 text-lg mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/shop">
              <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-8 h-12 font-bold">Khám phá sản phẩm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-3 text-slate-900">Giỏ hàng của bạn</h1>
        <p className="text-lg text-slate-600 mb-10">{cartItems.length} sản phẩm</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={item.id || `cart-item-${index}`} className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all">
                <div className="flex gap-6">
                  <Link to={`/product/${item.productId}`}>
                    <div className="w-28 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'}
                        alt={item.productName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="font-bold text-lg hover:text-indigo-600 mb-2 text-slate-900 line-clamp-2">
                        {item.productName}
                      </h3>
                    </Link>
                    {item.variantDetails && (
                      <p className="text-sm text-slate-600 mb-3">{item.variantDetails}</p>
                    )}
                    <p className="text-2xl font-bold text-slate-900">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Còn {item.stock} sản phẩm</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="hover:bg-red-50 rounded-xl text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="hover:bg-slate-100 rounded-none px-3"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-14 text-center font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="hover:bg-slate-100 rounded-none px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sticky top-24 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-slate-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-slate-900">{shipping.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-4 flex justify-between text-xl font-bold">
                  <span className="text-slate-900">Tổng cộng:</span>
                  <span className="text-indigo-600">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-14 text-base font-bold shadow-lg" size="lg">
                  Tiến hành thanh toán
                </Button>
              </Link>

              <Link to="/shop">
                <Button variant="outline" className="w-full mt-3 rounded-xl border-2 font-bold">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
