import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { WishlistDTO } from "../../types";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Danh sách yêu thích trống</h2>
          <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm yêu thích nào</p>
          <Link to="/shop">
            <Button>Khám phá sản phẩm</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sản phẩm yêu thích</h1>
        <p className="text-gray-600">{wishlist.length} sản phẩm</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-gray-100 relative group">
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(product.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Link>
              <CardContent className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold hover:text-blue-600 mb-2 line-clamp-2">{product.name}</h3>
                </Link>
                {product.support && (
                  <p className="text-xs text-gray-500 mb-2">{product.support}</p>
                )}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="mb-2">
                  <span className="text-lg font-bold text-blue-600">
                    {product.basePrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                {product.averageRating && product.reviewCount && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-semibold">{product.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => handleAddToCart(item)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
