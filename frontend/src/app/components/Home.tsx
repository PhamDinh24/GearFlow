import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { orderApi, reviewApi, productApi } from "../services/api";
import { OrderDTO, ReviewDTO } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";
import { toast } from "sonner";

export function Home() {
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0 });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [latest, bestSelling, publicStats] = await Promise.all([
          productApi.getLatestProducts(6),
          productApi.getFeaturedProducts(6),
          productApi.getPublicStats()
        ]);
        setNewProducts(latest.filter(p => p.active !== false && p.stock > 0));
        setBestSellers(bestSelling.filter(p => p.active !== false && p.stock > 0));
        if (publicStats) {
          setStats(publicStats);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 lg:pr-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                Bàn phím cơ cao cấp
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900">
                Nâng tầm<br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  trải nghiệm
                </span><br />
                gõ phím
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Bộ sưu tập bàn phím cơ với switch chính hãng, keycap premium và thiết kế tùy biến hoàn toàn.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-base h-auto rounded-xl">
                    Khám phá sản phẩm
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-base h-auto rounded-xl border-2">
                    Xem bộ sưu tập
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4 border-t">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalProducts}+</div>
                  <div className="text-sm text-slate-600">Sản phẩm</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}+</div>
                  <div className="text-sm text-slate-600">Khách hàng</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">Hỗ trợ</div>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative lg:h-[600px] h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558050032-160f36233a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Mechanical Keyboard"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="mb-12">
          <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
            Sản phẩm mới
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Vừa ra mắt</h2>
          <p className="text-lg text-slate-600">Những sản phẩm mới nhất trong bộ sưu tập</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {newProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-4">
              Bán chạy nhất
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Được yêu thích</h2>
            <p className="text-lg text-slate-600">Top sản phẩm được khách hàng tin dùng</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900">Hot-swappable</h3>
            <p className="text-slate-600 leading-relaxed">Thay đổi switch dễ dàng không cần hàn, tùy biến trải nghiệm theo ý muốn</p>
          </div>

          <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900">Giao hàng nhanh</h3>
            <p className="text-slate-600 leading-relaxed">Giao hàng tận nơi trong 1-2 ngày, miễn phí với đơn trên 1 triệu</p>
          </div>

          <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900">Bảo hành uy tín</h3>
            <p className="text-slate-600 leading-relaxed">Bảo hành 12-24 tháng chính hãng, đổi mới trong 7 ngày đầu</p>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ProductCardProps {
  product: any;
}

function ProductCard({ product }: ProductCardProps) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (isLoggedIn) {
        try {
          const inWishlist = await wishlistService.checkInWishlist(product.id);
          setIsInWishlist(inWishlist);
        } catch (error) {}
      }
    };
    checkWishlist();
  }, [isLoggedIn, product.id]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(product.id);
        setIsInWishlist(true);
      }
    } catch (error) {}
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) { toast.error('Vui lòng đăng nhập'); return; }
    const variantId = product.variants?.[0]?.id;
    if (!variantId) { toast.error('Sản phẩm chưa có sẵn'); return; }
    try {
      setAddingToCart(true);
      await cartService.addToCart(variantId, 1);
      toast.success('Đã thêm vào giỏ hàng');
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) { toast.error('Không thể thêm vào giỏ'); }
    finally { setAddingToCart(false); }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) { toast.error('Vui lòng đăng nhập'); return; }
    const variantId = product.variants?.[0]?.id;
    if (!variantId) { toast.error('Sản phẩm chưa có sẵn'); return; }
    try {
      setAddingToCart(true);
      await cartService.addToCart(variantId, 1);
      navigate('/checkout', { state: { selectedVariantIds: [variantId] } });
    } catch (error) { toast.error('Không thể mua ngay'); }
    finally { setAddingToCart(false); }
  };

  return (
    <div className="group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-slate-100 rounded-2xl mb-4 relative">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {(product.isNew || product.isBestSeller) && (
            <div className="absolute top-3 right-3">
              <Badge
                variant={product.isNew ? "default" : "secondary"}
                className={product.isNew ? "bg-indigo-600" : "bg-pink-600"}
              >
                {product.isNew ? "Mới" : "Hot"}
              </Badge>
            </div>
          )}
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-slate-200 hover:bg-slate-50 p-2"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 font-bold shadow-md shadow-indigo-100"
              onClick={handleBuyNow}
              disabled={addingToCart}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
