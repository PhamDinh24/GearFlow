import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { apiService, ProductDTO } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Heart, ShoppingCart, Search, Loader } from "lucide-react";
import { toast } from "sonner";

export function ShopIntegrated() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getProducts(0, 20);
        setProducts(response.content || response);
      } catch (error) {
        toast.error('Không thể tải sản phẩm');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'newest') {
      result = [...result].reverse();
    }

    return result;
  }, [products, searchQuery, sortBy]);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập trước');
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Sort */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="featured">Nổi bật</option>
            <option value="price-low">Giá: Thấp đến Cao</option>
            <option value="price-high">Giá: Cao đến Thấp</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${product.id}`}>
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </CardContent>
              </Link>

              <CardFooter className="flex flex-col gap-3 p-4">
                <div className="w-full">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="w-full flex items-center justify-between">
                  <span className="font-bold text-lg">
                    {(product.basePrice / 1000000).toFixed(1)}M
                  </span>
                  {product.isNew && <Badge variant="secondary">Mới</Badge>}
                </div>

                <div className="w-full flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
