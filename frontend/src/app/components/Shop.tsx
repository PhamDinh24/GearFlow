import { useState, useMemo, useEffect } from "react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cửa Hàng Bàn Phím</h1>
        <p className="text-gray-600">
          Tìm thấy {filteredProducts.length} sản phẩm
          {activeFilterCount > 0 && ` (${activeFilterCount} bộ lọc đang áp dụng)`}
        </p>
      </div>

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
                Tìm kiếm theo danh mục, thương hiệu và giá
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
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Bộ lọc</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
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
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `Không tìm thấy sản phẩm với từ khóa "${searchQuery}"`
                  : 'Không tìm thấy sản phẩm phù hợp với bộ lọc'}
              </p>
              <Button onClick={clearFilters}>Xóa bộ lọc</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isInWishlist={wishlistItems.has(product.id)}
                  onToggleWishlist={() => handleToggleWishlist(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                />
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
            Chỉ hiển thị còn hàng
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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {!hasStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">Hết hàng</Badge>
            </div>
          )}
          {hasStock && product.stock < 10 && (
            <Badge className="absolute top-2 right-2 bg-orange-500">
              Còn {product.stock}
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold hover:text-blue-600 mb-2 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        
        {product.support && (
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span className="font-medium">Hỗ trợ:</span> {product.support}
          </p>
        )}
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              {product.basePrice.toLocaleString('vi-VN')}đ
            </span>
            {hasVariants && product.variants.some(v => v.priceModifier > 0) && (
              <span className="text-xs text-gray-500 ml-2">
                +{Math.min(...product.variants.map(v => v.priceModifier)).toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
        </div>
        
        {product.averageRating && product.reviewCount ? (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.averageRating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({product.reviewCount} đánh giá)</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400 mb-2">Chưa có đánh giá</div>
        )}
        
        {hasVariants && (
          <div className="text-xs text-gray-500">
            {product.variants.length} tùy chọn
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          className="flex-1" 
          size="sm" 
          disabled={!hasStock || !hasVariants}
          onClick={onAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {!hasStock ? 'Hết hàng' : !hasVariants ? 'Không có sẵn' : 'Thêm vào giỏ'}
        </Button>
        <Button 
          variant={isInWishlist ? "default" : "outline"} 
          size="sm"
          onClick={onToggleWishlist}
          className={isInWishlist ? "bg-red-500 hover:bg-red-600" : ""}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
}