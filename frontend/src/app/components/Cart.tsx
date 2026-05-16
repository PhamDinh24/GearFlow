import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { cartService } from "../services/cartService";
import { Button } from "./ui/button";
import { Minus, Plus, Trash2, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";

interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  imageUrl: string;
  variantDetails: string;
  quantity: number;
  price: number;
  subtotal: number;
  stock: number;
}

export function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = await cartService.getCart();
      const items = cart.items || [];
      setCartItems(items);
      setSelectedItems(items.map(i => i.variantId)); // Default select all
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = cartItems.find(i => i.variantId === variantId);
    if (!item) return;
    
    if (newQuantity > item.stock) {
      toast.error(`Chỉ còn ${item.stock} sản phẩm trong kho`);
      return;
    }
    
    try {
      await cartService.updateCartItem(variantId, newQuantity);
      setCartItems(items =>
        items.map(item =>
          item.variantId === variantId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      await cartService.removeCartItem(variantId);
      setCartItems(items => items.filter(item => item.variantId !== variantId));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const toggleSelectItem = (variantId: string) => {
    setSelectedItems(prev => 
      prev.includes(variantId) 
        ? prev.filter(id => id !== variantId) 
        : [...prev, variantId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(i => i.variantId));
    }
  };

  const subtotal = cartItems
    .filter(item => selectedItems.includes(item.variantId))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 50000 : 0;
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
        <div className="flex items-center justify-between mb-8">
          <p className="text-lg text-slate-600">{cartItems.length} sản phẩm</p>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Checkbox 
              id="select-all" 
              checked={selectedItems.length === cartItems.length && cartItems.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
              Chọn tất cả
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.variantId} className={`bg-white border-2 rounded-2xl p-6 transition-all ${
                selectedItems.includes(item.variantId) ? 'border-indigo-600 shadow-lg shadow-indigo-50' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex gap-6 items-center">
                  <div className="flex-shrink-0">
                    <Checkbox 
                      checked={selectedItems.includes(item.variantId)}
                      onCheckedChange={() => toggleSelectItem(item.variantId)}
                      className="w-6 h-6 border-2"
                    />
                  </div>
                  
                  <Link to={`/product/${item.productId}`}>
                    <div className="w-28 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={item.imageUrl || 'https://placehold.co/400x400?text=GearFlow'}
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
                      onClick={() => removeItem(item.variantId)}
                      className="hover:bg-red-50 rounded-xl text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
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
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
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

              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-14 text-base font-bold shadow-lg disabled:opacity-50" 
                size="lg"
                disabled={selectedItems.length === 0}
                onClick={() => navigate('/checkout', { state: { selectedVariantIds: selectedItems } })}
              >
                Tiến hành thanh toán
              </Button>

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
