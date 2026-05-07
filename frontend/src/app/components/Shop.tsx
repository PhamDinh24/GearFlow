import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { productService, type Product } from "../services/productService";
import { wishlistService } from "../services/wishlistService";
import { useAuth } from "../context/AuthContext";
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
import { Heart, ShoppingCart, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { toast } from "sonner";

export function Shop() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const pageSize = 12;
  
  // Multi-dimensional filters
  const [filters, setFilters] = useState({
    categoryIds: [] as string[],
    brandIds: [] as string[],
    priceRange: [0, 5000000] as [number, number],
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let result;
        if (searchQuery) {
          result = await productService.searchProducts(searchQuery, currentPage, pageSize);
        } else {
          result = await productService.getAllProducts(currentPage, pageSize);
        }
        setProducts(result.content);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [searchQuery, currentPage]);

  // Load categories and brands
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    };
    loadFilters();
  }, []);

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
      categoryIds: [],
      brandIds: [],
      priceRange: [0, 5000000],
    });
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    if (filters.categoryIds.length > 0) {
      result = result.filter(p => filters.categoryIds.includes(p.categoryId));
    }

    // Brand filter
    if (filters.brandIds.length > 0) {
      result = result.filter(p => filters.brandIds.includes(p.brandId));
    }

    // Price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) {
      result = result.filter(p => 
        p.basePrice >= filters.priceRange[0] && p.basePrice <= filters.priceRange[1]
      );
    }

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
      default:
        // Featured: sort by creation date (newest first)
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, filters, sortBy]);

  const activeFilterCount = 
    filters.categoryIds.length +
    filters.brandIds.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000 ? 1 : 0);

  // Client-side pagination for filtered results
  const ITEMS_PER_PAGE = 12;
  const [shopPage, setShopPage] = useState(1);
  const totalShopPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedShopProducts = filteredProducts.slice(
    (shopPage - 1) * ITEMS_PER_PAGE,
    shopPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => { setShopPage(1); }, [filteredProducts.length, searchQuery]);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-slate-900">Tất cả sản phẩm</h1>
        <p className="text-lg text-slate-600">
          Tìm thấy <span className="font-semibold text-slate-900">{filteredProducts.length}</span> sản phẩm
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
                categories={categories}
                brands={brands}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <aside className="hidden sm:block w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl text-slate-900">Bộ lọc</h2>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  <X className="w-4 h-4 mr-1" />
                  Xóa ({activeFilterCount})
                </Button>
              )}
            </div>
            <FilterContent
              filters={filters}
              toggleArrayFilter={toggleArrayFilter}
              setFilters={setFilters}
              categories={categories}
              brands={brands}
            />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 text-lg mb-4">Không tìm thấy sản phẩm phù hợp</p>
              <Button onClick={clearFilters} className="bg-slate-900 hover:bg-slate-800 rounded-lg">Xóa bộ lọc</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedShopProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalShopPages > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-600">
                    Hiển thị <span className="font-semibold text-slate-900">{(shopPage - 1) * ITEMS_PER_PAGE + 1}</span> đến{' '}
                    <span className="font-semibold text-slate-900">{Math.min(shopPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> trong{' '}
                    <span className="font-semibold text-slate-900">{filteredProducts.length}</span> sản phẩm
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShopPage(p => Math.max(1, p - 1))}
                      disabled={shopPage === 1}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalShopPages) }, (_, i) => {
                        let page: number;
                        if (totalShopPages <= 5) {
                          page = i + 1;
                        } else if (shopPage <= 3) {
                          page = i + 1;
                        } else if (shopPage >= totalShopPages - 2) {
                          page = totalShopPages - 4 + i;
                        } else {
                          page = shopPage - 2 + i;
                        }
                        return (
                          <Button
                            key={page}
                            variant={shopPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShopPage(page)}
                            className={`w-9 h-9 rounded-lg ${shopPage === page ? 'bg-slate-900 text-white' : ''}`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShopPage(p => Math.min(totalShopPages, p + 1))}
                      disabled={shopPage === totalShopPages}
                      className="rounded-lg"
                    >
                      Sau
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
}

function FilterContent({ filters, toggleArrayFilter, setFilters, categories, brands }: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <Label className="font-semibold mb-3 block">Danh mục</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map(category => (
              <div key={category.id} className="flex items-center">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categoryIds.includes(category.id)}
                  onCheckedChange={() => toggleArrayFilter('categoryIds', category.id)}
                />
                <label htmlFor={`category-${category.id}`} className="ml-2 text-sm cursor-pointer">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="border-t pt-6">
          <Label className="font-semibold mb-3 block">Thương hiệu</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <div key={brand.id} className="flex items-center">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={filters.brandIds.includes(brand.id)}
                  onCheckedChange={() => toggleArrayFilter('brandIds', brand.id)}
                />
                <label htmlFor={`brand-${brand.id}`} className="ml-2 text-sm cursor-pointer">
                  {brand.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="border-t pt-6">
        <Label className="font-semibold mb-3 block">Khoảng giá</Label>
        <div className="space-y-2">
          {[
            { label: 'Tất cả', range: [0, 5000000] },
            { label: 'Dưới 1 triệu', range: [0, 1000000] },
            { label: '1-2 triệu', range: [1000000, 2000000] },
            { label: '2-3 triệu', range: [2000000, 3000000] },
            { label: 'Trên 3 triệu', range: [3000000, 5000000] },
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
                    priceRange: checked ? range as [number, number] : [0, 5000000] 
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
  const { isLoggedIn } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if product was created in last 30 days
  const isNew = new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlist = async () => {
      if (isLoggedIn) {
        try {
          const inWishlist = await wishlistService.checkInWishlist(product.id);
          setIsInWishlist(inWishlist);
        } catch (error) {
          // Ignore error
        }
      }
    };
    checkWishlist();
  }, [isLoggedIn, product.id]);
  
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }
    
    if (loading) return;
    
    try {
      setLoading(true);
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        toast.success('Đã xóa khỏi danh sách yêu thích');
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(product.id);
        toast.success('Đã thêm vào danh sách yêu thích');
        setIsInWishlist(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
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
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-indigo-600">Mới</Badge>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <Badge className="bg-pink-600">Sắp hết</Badge>
            )}
          </div>
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </button>
        </div>
      </Link>

      <div className="space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {product.brandId && (
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
              {product.brandId}
            </span>
          )}
          {product.stock > 0 ? (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">
              ✓ Còn hàng
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">
              Hết hàng
            </span>
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Giá</span>
            <span className="text-xl font-bold text-slate-900">
              {product.basePrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <Link to={`/product/${product.id}`}>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 rounded-lg">
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Xem
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}