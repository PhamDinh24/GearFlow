import { useEffect, useState } from 'react';
import { apiService, ProductDTO } from '../services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function ProductList() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(page, 12);
      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Không thể tải sản phẩm');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Đang tải sản phẩm...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sản phẩm</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <img
                src={product.image || 'https://via.placeholder.com/300?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/300?text=No+Image';
                }}
              />
              <CardTitle className="line-clamp-2">{product.name}</CardTitle>
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-2xl font-bold text-blue-600">
                ${product.basePrice.toFixed(2)}
              </div>
              {product.stock > 0 ? (
                <div className="text-sm text-green-600 mt-2">Còn hàng: {product.stock}</div>
              ) : (
                <div className="text-sm text-red-600 mt-2">Hết hàng</div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => handleAddToCart(product.id)}
                disabled={product.stock === 0}
              >
                Thêm vào giỏ
              </Button>
              <Button variant="outline" className="flex-1">
                Chi tiết
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Trang trước
          </Button>
          <div className="flex items-center px-4">
            Trang {page + 1} / {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
