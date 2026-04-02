import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { productApi } from "../services/api";
import type { ProductDTO } from "../types";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function Home() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [newestProducts, setNewestProducts] = useState<ProductDTO[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productApi.getProducts(0, 8);
      const allProducts = response.content;
      setProducts(allProducts);
      
      // Get newest products (sort by createdAt)
      const newest = [...allProducts]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      setNewestProducts(newest);
      
      // Get best selling products (sort by viewCount or random for now)
      // In real app, this should come from backend with actual sales data
      const bestSelling = [...allProducts]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5);
      setBestSellingProducts(bestSelling);
      
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Nâng tầm trải nghiệm gõ phím
            </h1>
            <p className="text-xl mb-8 text-indigo-100">
              Khám phá bộ sưu tập bàn phím cơ cao cấp với switch chính hãng và thiết kế độc đáo
            </p>
            <Link to="/shop">
              <Button size="lg" variant="secondary">
                Khám phá ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">🔥 Sản phẩm bán chạy</h2>
            <p className="text-gray-600 mt-2">Top 5 sản phẩm được mua nhiều nhất</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {bestSellingProducts.map((product, index) => (
            <div key={product.id} className="relative">
              <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Newest Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">✨ Sản phẩm mới nhất</h2>
            <p className="text-gray-600 mt-2">Những sản phẩm vừa được ra mắt</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {newestProducts.map(product => (
            <div key={product.id} className="relative">
              <Badge className="absolute top-2 right-2 z-10 bg-green-500">Mới</Badge>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
            <p className="text-gray-600 mt-2">Những sản phẩm bàn phím cơ chất lượng cao</p>
          </div>
          <Link to="/shop">
            <Button variant="outline">Xem tất cả</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Hot-swappable</h3>
              <p className="text-gray-600">Thay đổi switch dễ dàng không cần hàn</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng tận nơi trong 1-2 ngày</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Bảo hành uy tín</h3>
              <p className="text-gray-600">Bảo hành 12-24 tháng, đổi mới trong 7 ngày</p>
            </div>
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      // Use first variant if available, otherwise use product ID
      const variantId = product.variants && product.variants.length > 0 
        ? product.variants[0].id 
        : product.id;
      await addToCart(variantId, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold hover:text-blue-600 line-clamp-2">{product.name}</h3>
          </Link>
        </div>
        {product.support && (
          <p className="text-xs text-gray-500 mb-2">{product.support}</p>
        )}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-blue-600">
              {product.basePrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600">Còn hàng</span>
          ) : (
            <span className="text-xs text-red-600">Hết hàng</span>
          )}
        </div>
        {product.averageRating && product.reviewCount && (
          <div className="flex items-center gap-1 mt-2">
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
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Thêm vào giỏ
        </Button>
        <Button variant="outline" size="sm">
          <Heart className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
