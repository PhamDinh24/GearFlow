import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { productApi, wishlistApi } from "../services/api";
import { ProductDTO, ProductVariantDTO } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Heart, ShoppingCart, ArrowLeft, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDTO | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const data = await productApi.getProductById(productId);
      setProduct(data);
      // Select first variant by default
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      
      // Check if product is in wishlist
      if (isAuthenticated) {
        try {
          const inWishlist = await wishlistApi.isInWishlist(productId);
          setIsInWishlist(inWishlist);
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      const variantId = selectedVariant?.id || product.id;
      await addToCart(variantId, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(product.id);
        setIsInWishlist(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await wishlistApi.addToWishlist(product.id);
        setIsInWishlist(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error(error.message || 'Không thể cập nhật danh sách yêu thích');
    }
  };

  const getTotalPrice = () => {
    if (!product) return 0;
    const basePrice = product.basePrice;
    const modifier = selectedVariant?.priceModifier || 0;
    return (basePrice + modifier) * quantity;
  };

  const getAvailableStock = () => {
    if (selectedVariant) {
      return selectedVariant.availableStock || selectedVariant.stock || 0;
    }
    return product?.stock || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/shop">
          <Button>Quay về cửa hàng</Button>
        </Link>
      </div>
    );
  }

  const availableStock = getAvailableStock();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/shop">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden sticky top-24">
            <img 
              src={product.imageUrl || 'https://via.placeholder.com/600?text=No+Image'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.support && (
              <p className="text-gray-600 mb-2">{product.support}</p>
            )}
            {product.averageRating && product.reviewCount && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-xl">★</span>
                  <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">({product.reviewCount} đánh giá)</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="text-base mb-3 block font-semibold">Tùy chọn</label>
              <div className="grid grid-cols-1 gap-3">
                {product.variants.map(variant => (
                  <div
                    key={variant.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        {variant.color && <span className="font-semibold">{variant.color}</span>}
                        {variant.switchType && <span className="text-sm text-gray-600"> • {variant.switchType}</span>}
                        {variant.keycapSet && <span className="text-sm text-gray-600"> • {variant.keycapSet}</span>}
                        {variant.connectionType && <span className="text-sm text-gray-600"> • {variant.connectionType}</span>}
                        <div className="text-xs text-gray-500 mt-1">
                          Còn {variant.availableStock || variant.stock || 0} sản phẩm
                        </div>
                      </div>
                      {variant.priceModifier !== 0 && (
                        <span className={`font-bold ${variant.priceModifier > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variant.priceModifier > 0 ? '+' : ''}{variant.priceModifier.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="mb-6">
              <label className="text-base mb-3 block font-semibold">Thông số kỹ thuật</label>
              <div className="grid grid-cols-2 gap-3">
                {product.attributes.map(attr => (
                  <div key={attr.id} className="border rounded-lg p-3">
                    <div className="text-xs text-gray-500">{attr.name || attr.attrName}</div>
                    <div className="font-semibold">{attr.value || attr.attrValue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Card */}
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm text-gray-600">Giá:</span>
                <span className="text-4xl font-bold text-blue-600">
                  {getTotalPrice().toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Tình trạng: <span className={availableStock > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {availableStock > 0 ? `Còn hàng (${availableStock} sản phẩm)` : 'Hết hàng'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          {availableStock > 0 && (
            <div className="mb-6">
              <label className="text-base mb-3 block font-semibold">Số lượng</label>
              <div className="flex items-center border rounded-lg w-fit">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-16 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleAddToCart}
              disabled={availableStock === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {availableStock > 0 ? `Thêm vào giỏ (${getTotalPrice().toLocaleString('vi-VN')}đ)` : 'Hết hàng'}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleAddToWishlist}
              className={isInWishlist ? "text-red-500 border-red-500" : ""}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
