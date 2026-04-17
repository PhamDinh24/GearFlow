import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { productApi, categoryApi, brandApi, wishlistApi } from "../services/api";
import type { ProductDTO, CategoryDTO, BrandDTO } from "../types";
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
import { Heart, ShoppingCart, Search, SlidersHorizontal, X, Star } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function Shop() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productApi.getProducts(0, 100),
        categoryApi.getCategories(),
        brandApi.getBrands()
      ]);
      
      setProducts(productsRes.content || []);
      setCategories(categoriesRes || []);
      setBrands(brandsRes || []);
      
      // Load wishlist if authenticated
      if (isAuthenticated) {
        try {
          const wishlist = await wishlistApi.getWishlist();
          setWishlistItems(new Set(wishlist.map(item => item.productId)));
        } catch (error) {
          console.log('Could not load wishlist');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: [0, 5000000] as [number, number],
    inStock: false,
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
      categories: [],
      brands: [],
      priceRange: [0, 5000000],
      inStock: false,
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.support && p.support.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.categoryId));
    }

    // Brand filter
    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brandId));
    }

    // Price range filter
    result = result.filter(p =>
      p.basePrice >= filters.priceRange[0] && p.basePrice <= filters.priceRange[1]
    );

    // In stock filter
    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
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
      case 'rating':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeFilterCount = 
    filters.categories.length +
    filters.brands.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000000 ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const handleAddToCart = async (product: ProductDTO) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (!product.variants || product.variants.length === 0) {
      toast.error('Sản phẩm không có biến thể');
      return;
    }

    try {
      const firstVariant = product.variants[0];
      await addToCart(firstVariant.id, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      navigate('/login');
      return;
    }

    try {
      if (wishlistItems.has(productId)) {
        await wishlistApi.removeFromWishlist(productId);
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await wishlistApi.addToWishlist(productId);
        setWishlistItems(prev => new Set(prev).add(productId));
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải sản phẩm...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Shop Header Banner */}
      <section className="bg-slate-950 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">CỬA HÀNG</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Khám phá bộ sưu tập bàn phím cơ và phụ kiện custom cao cấp nhất để nâng tầm trải nghiệm gõ phím của bạn.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, mô tả, hỗ trợ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Nổi bật</SelectItem>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="rating">Đánh giá cao</SelectItem>
            <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
            <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
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
              <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
              <SheetDescription>
                Lọc
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
        <aside className="hidden sm:block w-64 flex-shrink-0">
          <Card className="sticky top-24 border-none shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Bộ lọc</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                    <X className="w-3 h-3 mr-1" />
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
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {paginatedProducts.length === 0 ? (
            <Card className="p-16 text-center border-dashed border-2 bg-transparent shadow-none">
              <p className="text-gray-500 text-lg mb-6">
                {searchQuery 
                  ? `Không tìm thấy sản phẩm với từ khóa "${searchQuery}"`
                  : 'Chưa có sản phẩm nào phù hợp với bộ lọc hiện tại'}
              </p>
              <Button onClick={clearFilters} size="lg" className="rounded-full">Xóa bộ lọc ngay</Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    isInWishlist={wishlistItems.has(product.id)}
                    onToggleWishlist={() => handleToggleWishlist(product.id)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border-gray-200"
                  >
                    Trước
                  </Button>
                  
                  <div className="flex bg-white rounded-full border shadow-sm px-2 py-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      // Simple pagination display logic to limit buttons
                      if (
                        totalPages > 5 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - currentPage) > 1
                      ) {
                        return pageNum === 2 || pageNum === totalPages - 1 ? (
                          <span key={`dots-${pageNum}`} className="px-2 py-1 text-gray-400">...</span>
                        ) : null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            currentPage === pageNum 
                              ? "bg-blue-600 text-white shadow-md" 
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border-gray-200"
                  >
                    Tiếp
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

interface FilterContentProps {
  filters: any;
  toggleArrayFilter: (key: any, value: string) => void;
  setFilters: (fn: (prev: any) => any) => void;
  categories: CategoryDTO[];
  brands: BrandDTO[];
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
                  id={`cat-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                />
                <label htmlFor={`cat-${category.id}`} className="ml-2 text-sm cursor-pointer">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <Label className="font-semibold mb-3 block">Thương hiệu</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <div key={brand.id} className="flex items-center">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={filters.brands.includes(brand.id)}
                  onCheckedChange={() => toggleArrayFilter('brands', brand.id)}
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
      <div>
        <Label className="font-semibold mb-3 block">Khoảng giá</Label>
        <div className="space-y-2">
          {[
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

      {/* Stock Status */}
      <div>
        <Label className="font-semibold mb-3 block">Tình trạng</Label>
        <div className="flex items-center">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => 
              setFilters(prev => ({ ...prev, inStock: checked as boolean }))
            }
          />
          <label htmlFor="in-stock" className="ml-2 text-sm cursor-pointer">
            Còn hàng
          </label>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: ProductDTO;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}

function ProductCard({ product, isInWishlist, onToggleWishlist, onAddToCart }: ProductCardProps) {
  const hasStock = product.stock > 0;
  const hasVariants = product.variants && product.variants.length > 0;
  
  return (
    <Card className="overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group border-none rounded-3xl bg-white flex flex-col h-full relative">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-[4/5] overflow-hidden bg-slate-50 relative">
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <button 
            onClick={(e) => { e.preventDefault(); onToggleWishlist(); }}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
              isInWishlist ? "bg-red-500 text-white" : "bg-white/80 text-gray-900 backdrop-blur-md opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            }`}
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          {!hasStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10">
              <Badge variant="destructive" className="text-sm px-6 py-2 rounded-full shadow-2xl uppercase tracking-widest font-black">Tạm hết hàng</Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-3">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem] leading-tight mb-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {product.support || 'Custom'}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mb-1">Giá khởi điểm</p>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                {product.basePrice.toLocaleString('vi-VN')}
                <span className="text-xs ml-0.5 align-top">đ</span>
              </span>
            </div>
            
            <Button 
              size="icon"
              className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white transition-all duration-300 shadow-xl shadow-slate-200"
              disabled={!hasStock || !hasVariants}
              onClick={onAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.averageRating || 5)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="text-[10px] font-bold text-slate-500 ml-1">
                {product.reviewCount || 0} Nhận xét
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-none px-6 pb-6">
        <Button 
          className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 border-none font-bold uppercase tracking-widest text-[10px] transition-all"
          asChild
        >
          <Link to={`/product/${product.id}`}>Chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
