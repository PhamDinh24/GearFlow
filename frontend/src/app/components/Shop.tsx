import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { apiService, ProductDTO } from "../services/api";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Heart, ShoppingCart, Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts(0, 100); // Load more products for shop
      setProducts(response.content || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const [filters, setFilters] = useState({
    priceRange: [0, 10000000] as [number, number],
  });

  const toggleArrayFilter = (filterKey: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterKey] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [filterKey]: newArray };
    });
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 10000000],
    });
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.support && p.support.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Price range filter
    result = result.filter(p =>
      p.basePrice >= filters.priceRange[0] && p.basePrice <= filters.priceRange[1]
    );

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      default:
        // Featured: prioritize products with reviews and high ratings
        result.sort((a, b) => {
          const aScore = (a.averageRating || 0) * (a.reviewCount || 0);
          const bScore = (b.averageRating || 0) * (b.reviewCount || 0);
          return bScore - aScore;
        });
    }

    return result;
  }, [searchQuery, filters, sortBy, products]);

  const activeFilterCount = 
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000000 ? 1 : 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải sản phẩm...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tất cả sản phẩm</h1>
        <p className="text-gray-600">
          Tìm thấy {filteredProducts.length} sản phẩm
        </p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm bàn phím..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Nổi bật</SelectItem>
            <SelectItem value="rating">Đánh giá cao</SelectItem>
            <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
            <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
            <SelectItem value="name">Tên A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Lọc
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
              <SheetDescription>
                Tìm kiếm theo thuộc tính sản phẩm
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent 
                filters={filters} 
                toggleArrayFilter={toggleArrayFilter}
                setFilters={setFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <aside className="hidden sm:block w-64 flex-shrink-0">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Bộ lọc</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Xóa
                  </Button>
                )}
              </div>
              <FilterContent 
                filters={filters} 
                toggleArrayFilter={toggleArrayFilter}
                setFilters={setFilters}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm phù hợp</p>
              <Button onClick={clearFilters}>Xóa bộ lọc</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterContentProps {
  filters: any;
  toggleArrayFilter: (key: any, value: string) => void;
  setFilters: (fn: (prev: any) => any) => void;
}

function FilterContent({ filters, toggleArrayFilter, setFilters }: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="font-semibold mb-3 block">Khoảng giá</Label>
        <div className="space-y-2">
          {[
            { label: 'Dưới 1 triệu', range: [0, 1000000] },
            { label: '1-2 triệu', range: [1000000, 2000000] },
            { label: '2-3 triệu', range: [2000000, 3000000] },
            { label: 'Trên 3 triệu', range: [3000000, 10000000] },
          ].map(({ label, range }) => (
            <div key={label} className="flex items-center">
              <Checkbox
                id={`price-${label}`}
                checked={
                  filters.priceRange[0] === range[0] && 
                  filters.priceRange[1] === range[1]
                }
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    priceRange: checked ? range as [number, number] : [0, 10000000] 
                  }))
                }
              />
              <label htmlFor={`price-${label}`} className="ml-2 text-sm cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: any;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-bold text-blue-600">
              {product.basePrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
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
        <Button className="flex-1" size="sm" disabled={product.stock === 0}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
        </Button>
        <Button variant="outline" size="sm">
          <Heart className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}