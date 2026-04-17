import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { productApi, wishlistApi, recommendationApi } from "../services/api";
import { ProductDTO, ProductVariantDTO } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Heart, ShoppingCart, ArrowLeft, Minus, Plus, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
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
  const [relatedProducts, setRelatedProducts] = useState<ProductDTO[]>([]);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const data = await productApi.getProductById(productId);
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      
      try {
        let related = await recommendationApi.getRelatedProducts(productId, 4);
        if (related.length < 4) {
          const fallback = await productApi.getProducts(0, 5);
          const fallbackItems = (fallback.content || []).filter(p => p.id !== productId);
          related = [...related, ...fallbackItems].slice(0, 4);
        }
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      }
      
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

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    try {
      const variantId = selectedVariant?.id || product!.id;
      await addToCart(variantId, quantity);
      navigate('/checkout');
    } catch (error) {
      toast.error('Không thể thực hiện mua ngay');
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
      toast.error(error.message || 'Không thể cập nhật danh sách yêu thích');
    }
  };

  const getAvailableStock = () => {
    if (selectedVariant) return selectedVariant.availableStock || selectedVariant.stock || 0;
    return product?.stock || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;
  const availableStock = getAvailableStock();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Product Banner */}
      <section className="bg-slate-950 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <div>
            <Link to="/shop" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại cửa hàng</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{product.name}</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-1.5 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
               <Star className="w-4 h-4 text-yellow-500 fill-current" />
               <span className="font-bold">{product.averageRating?.toFixed(1) || '5.0'}</span>
             </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Card className="border-none rounded-[2.5rem] shadow-2xl shadow-slate-200 bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Product Gallery */}
              <div className="lg:w-1/2 p-8 lg:p-12 bg-slate-50/50">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl bg-white relative group">
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/600?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {availableStock < 10 && (
                    <Badge className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-1.5 rounded-full border-none shadow-lg font-bold">
                      Chỉ còn {availableStock}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] uppercase font-black tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{product.support || 'Custom'}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">In Stock</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">{product.description}</h2>
                  
                  <div className="flex items-end gap-3 mb-8">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">
                      {(product.basePrice + (selectedVariant?.priceModifier || 0)).toLocaleString('vi-VN')}
                      <span className="text-sm ml-0.5 align-top">đ</span>
                    </p>
                    {selectedVariant?.priceModifier ? (
                      <span className="text-sm font-bold text-slate-400 mb-1">Giá biến thể</span>
                    ) : null}
                  </div>
                </div>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-8">
                    <label className="text-xs uppercase font-black tracking-widest text-slate-400 mb-4 block">Chọn biến thể</label>
                    <div className="grid grid-cols-1 gap-3">
                      {product.variants.map(variant => (
                        <div
                          key={variant.id}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                            selectedVariant?.id === variant.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-slate-100 hover:border-slate-300'
                          }`}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{variant.color || 'Standard'}</span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {variant.switchType} {variant.keycapSet ? `• ${variant.keycapSet}` : ''}
                              </span>
                            </div>
                            {variant.priceModifier !== 0 && (
                              <span className={`text-xs font-black ${variant.priceModifier > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {variant.priceModifier > 0 ? '+' : ''}{variant.priceModifier.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="mt-auto pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="w-4 h-4" /></Button>
                      <span className="w-12 text-center font-black text-slate-900">{quantity}</span>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl" onClick={() => setQuantity(q => q + 1)} disabled={quantity >= availableStock}><Plus className="w-4 h-4" /></Button>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{availableStock} sản phẩm có sẵn</p>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={handleAddToCart}
                      className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200"
                      disabled={availableStock === 0}
                    >
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      Thêm vào giỏ
                    </Button>
                    <Button 
                      onClick={handleAddToWishlist}
                      variant="outline"
                      className={`w-14 h-14 rounded-2xl transition-all duration-300 ${isInWishlist ? 'bg-red-50 border-red-100 text-red-500' : 'border-slate-100 text-slate-400'}`}
                    >
                      <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <Button 
                    onClick={handleBuyNow}
                    className="w-full mt-4 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/30"
                    disabled={availableStock === 0}
                  >
                    Mua Ngay
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShieldCheck className="w-7 h-7" /></div>
            <div><p className="font-bold text-slate-900">Bảo Hành Chính Hãng</p><p className="text-xs text-slate-500">Cam kết 12 tháng 1 đổi 1</p></div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><Truck className="w-7 h-7" /></div>
            <div><p className="font-bold text-slate-900">Giao Hàng Siêu Tốc</p><p className="text-xs text-slate-500">Miễn phí nội thành Hà Nội</p></div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><RotateCcw className="w-7 h-7" /></div>
            <div><p className="font-bold text-slate-900">Đổi Trả 7 Ngày</p><p className="text-xs text-slate-500">Hoàn tiền nếu không hài lòng</p></div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Sản phẩm liên quan</h3>
              <Link to="/shop" className="text-blue-600 font-bold hover:underline">Xem tất cả</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="group">
                   <div className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500">
                     <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 relative">
                        <img src={p.imageUrl || ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <p className="font-bold text-slate-900 truncate mb-1">{p.name}</p>
                     <p className="text-blue-600 font-black tracking-tighter">{p.basePrice.toLocaleString('vi-VN')}đ</p>
                   </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
