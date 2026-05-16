import { useState, useEffect } from "react";
import { Link } from "react-router";
import { wishlistService, type WishlistItem } from "../services/wishlistService";
import { Button } from "./ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

export function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        const wishlist = await wishlistService.getWishlist();
        setWishlistItems(wishlist.items || []);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlistItems(items => items.filter(item => item.productId !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const wishlistProducts = wishlistItems.map(item => item.product);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4">
                  <div className="aspect-square bg-slate-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-white border border-slate-200 rounded-3xl text-center py-20">
            <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-pink-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-slate-900">Danh sách yêu thích trống</h2>
            <p className="text-slate-600 text-lg mb-8">Bạn chưa có sản phẩm yêu thích nào</p>
            <Link to="/shop">
              <Button className="bg-slate-900 hover:bg-slate-800 rounded-lg px-8 h-12">Khám phá sản phẩm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Sản phẩm yêu thích</h1>
            <p className="text-slate-600 text-lg">{wishlistProducts.length} sản phẩm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistProducts.map(product => (
            <div key={product.id} className="group">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-slate-100 rounded-2xl mb-4 relative">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const item = wishlistItems.find(w => w.product.id === product.id);
                      if (item) removeFromWishlist(item.productId);
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.brandId && (
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-slate-200">
                        {product.brandId}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>

              <div className="space-y-2">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Từ</span>
                    <span className="text-xl font-bold text-slate-900">
                      {product.basePrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <Link to={`/product/${product.id}`}>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 rounded-lg">
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Mua
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
