import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  Truck, 
  ChevronRight, 
  Star,
  Keyboard,
  MousePointer2,
  Cpu,
  Layers
} from "lucide-react";
import { useEffect, useState } from "react";
import { productApi } from "../services/api";
import type { ProductDTO } from "../types";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { animate, motion } from "motion/react";
import useEmblaCarousel from 'embla-carousel-react';

export function Home() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [newestProducts, setNewestProducts] = useState<ProductDTO[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Carousel refs
  const [emblaRefBest, emblaApiBest] = useEmblaCarousel({ align: 'start', loop: false });
  const [emblaRefNew, emblaApiNew] = useEmblaCarousel({ align: 'start', loop: false });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productApi.getProducts(0, 12);
      const allProducts = response.content;
      setProducts(allProducts);
      
      const newest = [...allProducts]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 8);
      setNewestProducts(newest);
      
      const bestSelling = [...allProducts]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 8);
      setBestSellingProducts(bestSelling);
      
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-200">
      {/* Hero Banner */}
      <section className="relative h-screen flex flex-col justify-center pt-16 pb-20 bg-slate-950">
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/assets/images/hero-banner.png" 
            alt="Mechanical Keyboard Hero"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-md px-3 py-1">
              New Collection 2026
            </Badge>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 text-white leading-tight">
              Nâng Tầm <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Trải Nghiệm Gõ
              </span>
            </h1>
            <p className="text-xl mb-10 text-slate-300 leading-relaxed max-w-lg">
              Khám phá thế giới bàn phím cơ Custom cao cấp. Từ âm thanh gõ hoàn hảo đến cảm giác nhấn tinh sảo nhất.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xl shadow-blue-500/30 text-lg transition-all hover:-translate-y-1 font-bold">
                  Mua Ngay
                </Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" className="h-14 px-10 border-2 border-white/50 bg-transparent text-white hover:bg-white hover:text-slate-950 backdrop-blur-sm rounded-xl text-lg transition-all hover:-translate-y-1 font-bold">
                  Khám Phá
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust/Benefits Bar */}
      <section className="relative z-30 max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border border-slate-100">
          <div className="flex items-center gap-4 group">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Giao Hàng Toàn Quốc</h4>
              <p className="text-sm text-slate-500">Miễn phí đơn hàng từ 2.000.000đ</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Bảo Hành Chính Hãng</h4>
              <p className="text-sm text-slate-500">Chính sách 1 đổi 1 trong 30 ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Hỗ Trợ Hot-swap</h4>
              <p className="text-sm text-slate-500">Dễ dàng tùy biến switch theo ý thích</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Khám Phá Danh Mục</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Chọn lựa phong cách bàn phím phù hợp với cá tính của bạn</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Linear Switch', icon: Zap, color: 'text-red-500', bg: 'bg-red-50' },
            { name: 'Tactile Switch', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-50' },
            { name: 'Keycap Sets', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50' },
            { name: 'Custom Kits', icon: Keyboard, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="group p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 ${cat.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon className={`w-7 h-7 ${cat.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{cat.name}</h3>
              <div className="flex items-center text-sm font-medium text-blue-600">
                Xem thêm <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Best Sellers Carousel */}
      <section className="py-16 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge className="bg-orange-100 text-orange-600 border-orange-200 mb-2">Most Wanted</Badge>
              <h2 className="text-4xl font-bold text-slate-900">🔥 Sản Phẩm Bán Chạy</h2>
            </div>
            <Link to="/shop">
              <Button variant="ghost" className="font-bold text-blue-600 hover:text-blue-700">
                Toàn bộ cửa hàng <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="overflow-hidden" ref={emblaRefBest}>
            <div className="flex gap-6 py-4">
              {bestSellingProducts.map((product) => (
                <div key={product.id} className="flex-[0_0_85%] sm:flex-[0_0_40%] lg:flex-[0_0_23%]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero 2 - Mid Page Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative min-h-[400px] flex items-center">
            <div className="absolute inset-0 opacity-40">
              <img src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
            </div>
            <div className="p-12 md:p-20 relative z-10 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Thiết Kế Đậm Chất <br/>
                <span className="text-blue-400">Riêng Bạn</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Hỗ trợ lube switch miễn phí cho các đơn hàng Custom Kit trọn bộ. Chỉ trong tuần này.
              </p>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 h-14 text-lg">
                Xây Dựng Ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newest Products Carousel */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge className="bg-green-100 text-green-600 border-green-200 mb-2">New Arrivals</Badge>
              <h2 className="text-4xl font-bold text-slate-900">✨ Bộ Sưu Tập Mới</h2>
            </div>
          </div>

          <div className="overflow-hidden" ref={emblaRefNew}>
            <div className="flex gap-6 py-4">
              {newestProducts.map((product) => (
                <div key={product.id} className="flex-[0_0_85%] sm:flex-[0_0_40%] lg:flex-[0_0_23%]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-10">Trusted by Global Enthusiasts</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <span className="text-2xl font-black">KEYCHRON</span>
            <span className="text-2xl font-black">AKKO</span>
            <span className="text-2xl font-black">LEOPOLD</span>
            <span className="text-2xl font-black">GLORIOUS</span>
            <span className="text-2xl font-black">FILCO</span>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ProductCardProps {
  product: ProductDTO;
}

function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      const variantId = product.variants && product.variants.length > 0 
        ? product.variants[0].id 
        : product.id;
      await addToCart(variantId, 1);
      toast.success('Đã thêm sản phẩm vào giỏ hàng 🛒');
    } catch (error) {
      toast.error('Có lỗi khi thêm vào giỏ hàng');
    }
  };

  return (
    <Card 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-3xl overflow-hidden border-none shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2"
    >
      <div className="relative aspect-[4/5] overflow-hidden p-2">
        <Link to={`/product/${product.id}`}>
          <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-50 relative">
            <img 
              src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay Gradient on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
        </Link>
        
        {/* Floating Actions */}
        <div className={`absolute bottom-6 inset-x-6 flex gap-2 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <Button 
            className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-bold border-none shadow-xl rounded-xl"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Mua Ngay
          </Button>
          <Button variant="outline" size="icon" className="w-10 h-10 bg-white/20 backdrop-blur-md border-white/30 text-white rounded-xl hover:bg-white hover:text-red-500">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-4 left-4 bg-orange-500 text-white border-none text-[10px] font-bold">Lắp Cảnh</Badge>
        )}
        {product.stock === 0 && (
          <Badge className="absolute top-4 left-4 bg-slate-600 text-white border-none text-[10px] font-bold">Hết Hàng</Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="mb-2">
           <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
          </Link>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">{product.support || 'Custom Series'}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-950">
              {product.basePrice.toLocaleString('vi-VN')} <span className="text-xs font-bold leading-none">₫</span>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-700">{product.averageRating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
