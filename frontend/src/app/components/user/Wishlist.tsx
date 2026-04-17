import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import type { WishlistDTO } from "../../types";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Heart, ShoppingCart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { useCart } from "../../context/CartContext";
import { wishlistApi } from "../../services/api";

export function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await wishlistApi.getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      toast.error('Không thể xóa khỏi danh sách yêu thích');
    }
  };

  const handleAddToCart = async (item: WishlistDTO) => {
    try {
      const variantId = item.product?.variants && item.product.variants.length > 0
        ? item.product.variants[0].id
        : item.productId;
      await addToCart(variantId, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
        <section className="bg-slate-950 text-white py-16 relative overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">YÊU THÍCH</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Danh sách sản phẩm bạn đang quan tâm.</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-20 border-none rounded-[3rem] shadow-xl shadow-slate-200">
            <CardContent>
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-red-200" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Danh sách yêu thích đang trống</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Hãy lưu lại những bộ bàn phím bạn ưng ý nhất để quay lại mua sau nhé.</p>
              <Link to="/shop">
                <Button size="lg" className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl px-10 h-14 font-bold transition-all shadow-lg shadow-slate-200">
                  Khám phá ngay
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Wishlist Header Banner */}
      <section className="bg-slate-950 text-white py-16 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">YÊU THÍCH</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Bạn đang lưu giữ {wishlist.length} sản phẩm mơ ước trong danh sách này.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.map(item => {
            const product = item.product ?? {
              id: item.productId,
              name: item.productName || 'Sản phẩm',
              imageUrl: 'https://via.placeholder.com/300?text=No+Image',
              description: '',
              support: '',
              basePrice: item.price || 0,
              variants: [],
              stock: item.price != null ? 1 : 0,
            };

            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group border-none rounded-3xl bg-white flex flex-col h-full relative">
                <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
                  <div className="aspect-[4/5] overflow-hidden bg-slate-50 relative">
                    <img 
                      src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <button 
                      onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/80 text-red-500 rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20 shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Link>

                <CardContent className="p-6 flex-1 flex flex-col">
                   <div className="mb-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-auto">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mb-1">Giá hiện tại</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter mb-6">
                      {product.basePrice.toLocaleString('vi-VN')}
                      <span className="text-sm ml-0.5 align-top">đ</span>
                    </p>

                    <div className="flex gap-2">
                       <Button 
                        className="flex-1 bg-slate-900 hover:bg-blue-600 text-white rounded-xl h-11 font-bold transition-all shadow-lg shadow-slate-200"
                        onClick={() => handleAddToCart(item)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Mua ngay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
