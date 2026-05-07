import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { productService, type Product, type ProductVariant } from "../services/productService";
import { reviewService, type Review } from "../services/reviewService";
import { wishlistService } from "../services/wishlistService";
import { cartService } from "../services/cartService";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Heart, ShoppingCart, Plus, Minus, Star, MessageSquare, CheckCircle, ChevronRight, Package } from "lucide-react";
import { toast } from "sonner";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoggedIn } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [productData, reviewsData, relatedData] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id).catch(() => []),
          productService.getRelatedProducts(id, 4).catch(() => []),
        ]);
        setProduct(productData);
        setReviews(reviewsData);
        setRelatedProducts(relatedData);
        
        // Set default variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        
        // Check wishlist status
        if (isLoggedIn) {
          try {
            const inWishlist = await wishlistService.checkInWishlist(id);
            setIsInWishlist(inWishlist);
          } catch (error) {
            // Ignore error
          }
        }
      } catch (error) {
        console.error('Failed to load product data:', error);
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isLoggedIn]);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/shop"><Button>Quay về cửa hàng</Button></Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn phiên bản sản phẩm');
      return;
    }
    
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    
    try {
      await cartService.addToCart(selectedVariant.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`, { 
        description: product.name 
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }
    
    if (wishlistLoading || !id) return;
    
    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(id);
        toast.success('Đã xóa khỏi danh sách yêu thích');
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(id);
        toast.success('Đã thêm vào danh sách yêu thích');
        setIsInWishlist(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }
    if (!id) {
      toast.error("Không tìm thấy sản phẩm");
      return;
    }

    try {
      const newReview = await reviewService.createReview({
        productId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      
      // Add new review to the list
      setReviews([newReview, ...reviews]);
      
      // Reset form
      setReviewComment("");
      setReviewRating(5);
      
      toast.success("Đánh giá của bạn đã được gửi! Cảm ơn bạn 🎉");
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại');
    }
  };

  const isNew = new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-slate-900">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-slate-900">Sản phẩm</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden sticky top-24 shadow-xl">
              <img 
                src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isNew && <Badge className="bg-indigo-600">Mới</Badge>}
                {product.stock < 10 && product.stock > 0 && (
                  <Badge className="bg-orange-600">Sắp hết hàng</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                {isNew && <Badge className="bg-indigo-600">Mới</Badge>}
                <Badge variant="outline" className="border-slate-200 text-slate-600">
                  {product.brandId}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">{product.name}</h1>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-slate-500">({reviews.length} đánh giá)</span>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Price Card */}
            <div className="mb-6 bg-gradient-to-br from-slate-50 to-indigo-50 border-2 border-slate-200 rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-slate-900">
                  {selectedVariant ? selectedVariant.finalPrice?.toLocaleString('vi-VN') : product.basePrice?.toLocaleString('vi-VN') || '0'}đ
                </span>
                {selectedVariant && selectedVariant.priceModifier !== 0 && (
                  <span className="text-lg text-slate-500 line-through">
                    {product.basePrice?.toLocaleString('vi-VN') || '0'}đ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(selectedVariant ? selectedVariant.stock : product.stock) > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700 font-medium">
                      Còn hàng ({selectedVariant ? selectedVariant.stock : product.stock} sản phẩm)
                    </span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 font-medium">Hết hàng</span>
                  </>
                )}
              </div>
            </div>

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Chọn phiên bản</Label>
                <RadioGroup 
                  value={selectedVariant?.id || ''} 
                  onValueChange={id => {
                    const variant = product.variants.find(v => v.id === id);
                    if (variant) setSelectedVariant(variant);
                  }}
                >
                  <div className="space-y-2">
                    {product.variants.map(variant => {
                      const displayPrice = variant.finalPrice || (product.basePrice + (variant.priceModifier || 0));
                      return (
                        <div 
                          key={variant.id} 
                          className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedVariant?.id === variant.id 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <RadioGroupItem value={variant.id} id={`variant-${variant.id}`} />
                          <Label htmlFor={`variant-${variant.id}`} className="cursor-pointer flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm">
                                  {[variant.switchType, variant.color, variant.keycapSet, variant.connectionType]
                                    .filter(Boolean)
                                    .join(' • ')}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {variant.inStock ? `Còn ${variant.stock} sản phẩm` : 'Hết hàng'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">
                                  {displayPrice.toLocaleString('vi-VN')}đ
                                </p>
                                {variant.priceModifier && variant.priceModifier !== 0 && (
                                  <p className={`text-xs font-semibold ${variant.priceModifier > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {variant.priceModifier > 0 ? '+' : ''}{(variant.priceModifier || 0).toLocaleString('vi-VN')}đ
                                  </p>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Số lượng:</span>
                <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="px-3 py-2 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-13 text-sm rounded-xl"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ · {((selectedVariant?.finalPrice || product.basePrice || 0) * quantity).toLocaleString()}đ
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-5 rounded-xl border-2 border-slate-300 hover:bg-rose-50 hover:border-rose-300"
                  onClick={handleAddToWishlist}
                  disabled={wishlistLoading}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-rose-500'}`} />
                </Button>
              </div>

              <Link to="/checkout">
                <Button 
                  size="lg" 
                  className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  disabled={product.stock === 0}
                >
                  Mua ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs: Specs & Reviews */}
        <div className="mb-16">
          <div className="flex border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'specs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Đánh giá ({reviews.length})
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <Card>
                <CardContent className="p-6">
                  <div className="divide-y divide-slate-100">
                    {[
                      { label: 'Thương hiệu', value: product.brandId },
                      { label: 'Danh mục', value: product.categoryId },
                      { label: 'Giá', value: `${product.basePrice?.toLocaleString('vi-VN') || '0'}đ` },
                      { label: 'Tồn kho', value: `${product.stock} sản phẩm` },
                      { label: 'Đánh giá trung bình', value: product.averageRating ? `${product.averageRating.toFixed(1)}/5` : 'Chưa có' },
                      { label: 'Số đánh giá', value: `${product.reviewCount} đánh giá` },
                      { label: 'Hỗ trợ', value: product.support || 'Liên hệ' },
                      { label: 'Ngày tạo', value: new Date(product.createdAt).toLocaleDateString('vi-VN') },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-3">
                        <span className="text-slate-500 text-sm">{item.label}</span>
                        <span className="font-semibold text-slate-900 text-sm text-right max-w-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-6">
              {/* Rating Summary */}
              {reviews.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-6 flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-slate-900">{avgRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{reviews.length} đánh giá</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-6">{star}★</span>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-6">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Write review */}
              {isLoggedIn ? (
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Viết đánh giá của bạn</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">Đánh giá sao</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setReviewRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoverRating || reviewRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review-comment" className="text-sm font-medium text-slate-700 mb-2 block">
                        Nội dung đánh giá
                      </Label>
                      <Textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        className="min-h-[120px] rounded-xl"
                      />
                    </div>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                      Gửi đánh giá
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-slate-600 mb-4">Vui lòng đăng nhập để viết đánh giá</p>
                  <Link to="/login">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Đăng nhập</Button>
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Chưa có đánh giá nào cho sản phẩm này</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">{review.userName || 'Khách hàng'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="group">
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-3">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-sm font-bold text-slate-900">{p.basePrice.toLocaleString('vi-VN')}đ</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
