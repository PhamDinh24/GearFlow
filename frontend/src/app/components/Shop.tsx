import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import { productService, type Product } from "../services/productService";
import { wishlistService } from "../services/wishlistService";
import { cartService } from "../services/cartService";
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
import { refreshHeaderCounts } from "../utils/events";

export function Shop() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 1000; // Fetch "all" products for client-side filtering
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  
  // Multi-dimensional filters
  const [filters, setFilters] = useState({
    categoryIds: [] as string[],
    brandIds: [] as string[],
    priceRange: [0, 5000000] as [number, number],
    layouts: [] as string[],
    connectionTypes: [] as string[],
    switchTypes: [] as string[],      // NEW
    keycapMaterials: [] as string[],  // NEW
    features: [] as string[],         // NEW
    inStock: true,                    // NEW
    onSale: false,                    // NEW
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let result;
        // Fetch a large number to handle all products on client side for now
        // This is appropriate for catalogs under ~500 items
        result = await productService.getAllProducts(0, pageSize);
        setProducts(result.content);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

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
      layouts: [],
      connectionTypes: [],
      switchTypes: [],
      keycapMaterials: [],
      features: [],
      inStock: true,
      onSale: false,
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

    // Layout filter
    if (filters.layouts.length > 0) {
      result = result.filter(p => p.layout && filters.layouts.includes(p.layout));
    }

    // Connection type filter
    if (filters.connectionTypes.length > 0) {
      result = result.filter(p => 
        (p.connectionType && filters.connectionTypes.includes(p.connectionType)) ||
        p.variants?.some(v => v.connectionType && filters.connectionTypes.includes(v.connectionType))
      );
    }

    // Switch type filter
    if (filters.switchTypes.length > 0) {
      result = result.filter(p => 
        p.variants?.some(v => v.switchType && filters.switchTypes.some(st => v.switchType?.toLowerCase().includes(st.toLowerCase())))
      );
    }

    // Keycap material filter
    if (filters.keycapMaterials.length > 0) {
      result = result.filter(p => 
        p.variants?.some(v => v.keycapSet && filters.keycapMaterials.some(km => v.keycapSet?.toLowerCase().includes(km.toLowerCase())))
      );
    }

    // Features filter
    if (filters.features.length > 0) {
      result = result.filter(p => {
        const productText = `${p.name} ${p.description || ''}`.toLowerCase();
        return filters.features.some(feature => productText.includes(feature.toLowerCase()));
      });
    }

    // In stock filter
    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
    }

    // On sale filter (products with variants that have price modifiers)
    if (filters.onSale) {
      result = result.filter(p => 
        p.variants?.some(v => v.priceModifier && v.priceModifier < 0)
      );
    }

    // Active filter
    result = result.filter(p => p.active !== false);

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

    // Search filter (client-side)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.brandId?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, filters, sortBy, searchQuery]);

  const activeFilterCount = 
    filters.categoryIds.length +
    filters.brandIds.length +
    filters.layouts.length +
    filters.connectionTypes.length +
    filters.switchTypes.length +
    filters.keycapMaterials.length +
    filters.features.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000 ? 1 : 0) +
    (filters.onSale ? 1 : 0);

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

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl text-slate-900">Bộ lọc</h2>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-0 h-auto">
                  Xóa tất cả
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Danh mục</Label>
                <Select 
                  value={filters.categoryIds[0] || "all"} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, categoryIds: v === "all" ? [] : [v] }))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Thương hiệu</Label>
                <Select 
                  value={filters.brandIds[0] || "all"} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, brandIds: v === "all" ? [] : [v] }))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Khoảng giá</Label>
                <Select 
                  value={filters.priceRange[1].toString()} 
                  onValueChange={(v) => {
                    const val = parseInt(v);
                    let range: [number, number] = [0, 5000000];
                    if (val === 1000000) range = [0, 1000000];
                    else if (val === 2000000) range = [1000000, 2000000];
                    else if (val === 3000000) range = [2000000, 3000000];
                    else if (val === 5000001) range = [3000000, 10000000];
                    setFilters(prev => ({ ...prev, priceRange: range }));
                  }}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả mức giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000000">Tất cả mức giá</SelectItem>
                    <SelectItem value="1000000">Dưới 1 triệu</SelectItem>
                    <SelectItem value="2000000">1 - 2 triệu</SelectItem>
                    <SelectItem value="3000000">2 - 3 triệu</SelectItem>
                    <SelectItem value="5000001">Trên 3 triệu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layout */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Layout</Label>
                <Select 
                  value={filters.layouts[0] || "all"} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, layouts: v === "all" ? [] : [v] }))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả layout</SelectItem>
                    {['60%', '65%', '75%', 'TKL', 'Full-size'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Connection */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Kết nối</Label>
                <Select 
                  value={filters.connectionTypes[0] || "all"} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, connectionTypes: v === "all" ? [] : [v] }))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả kết nối" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả kết nối</SelectItem>
                    {['Wired', 'Wireless', 'Bluetooth', 'Tri-mode'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Switch Type */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Loại switch</Label>
                <Select 
                  value={filters.switchTypes[0] || "all"} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, switchTypes: v === "all" ? [] : [v] }))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả switch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả switch</SelectItem>
                    {['Cherry MX', 'Gateron', 'Kailh', 'Blue', 'Red', 'Brown', 'Silent'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Keycap Material */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Chất liệu keycap</Label>
                <Select 
                  value={filters.keycapMaterials[0] || "all"} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, keycapMaterials: v === "all" ? [] : [v] }))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả chất liệu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chất liệu</SelectItem>
                    {['PBT', 'ABS', 'Double-shot', 'Dye-sub'].map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Tính năng</Label>
                <Select 
                  value={filters.features[0] || "all"} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, features: v === "all" ? [] : [v] }))}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Tất cả tính năng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tính năng</SelectItem>
                    {['RGB', 'Hot-swap', 'Programmable', 'Gaming', 'Compact'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Status */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStock: checked as boolean }))}
                  />
                  <label htmlFor="inStock" className="text-sm font-medium cursor-pointer">
                    Chỉ hiển thị còn hàng
                  </label>
                </div>
              </div>

              {/* On Sale */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onSale"
                    checked={filters.onSale}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onSale: checked as boolean }))}
                  />
                  <label htmlFor="onSale" className="text-sm font-medium cursor-pointer">
                    Đang giảm giá
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Top Bar inside Content */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-slate-200 rounded-2xl shadow-sm"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white border-slate-200 rounded-2xl shadow-sm">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Nổi bật nhất</SelectItem>
                  <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="w-full">
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

      {/* Layouts */}
      <div className="border-t pt-6">
        <Label className="font-semibold mb-3 block">Layout</Label>
        <div className="space-y-2">
          {['60%', '65%', '75%', 'TKL', 'Full-size'].map(layout => (
            <div key={layout} className="flex items-center">
              <Checkbox
                id={`layout-${layout}`}
                checked={filters.layouts.includes(layout)}
                onCheckedChange={() => toggleArrayFilter('layouts', layout)}
              />
              <label htmlFor={`layout-${layout}`} className="ml-2 text-sm cursor-pointer">
                {layout}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Types */}
      <div className="border-t pt-6">
        <Label className="font-semibold mb-3 block">Kết nối</Label>
        <div className="space-y-2">
          {['Wired', 'Wireless', 'Bluetooth', 'Tri-mode'].map(conn => (
            <div key={conn} className="flex items-center">
              <Checkbox
                id={`conn-${conn}`}
                checked={filters.connectionTypes.includes(conn)}
                onCheckedChange={() => toggleArrayFilter('connectionTypes', conn)}
              />
              <label htmlFor={`conn-${conn}`} className="ml-2 text-sm cursor-pointer">
                {conn}
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
      refreshHeaderCounts();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };
  
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      return;
    }

    const variantId = product.variants && product.variants.length > 0 
      ? product.variants[0].id 
      : null;

    if (!variantId) {
      toast.error('Sản phẩm này chưa có biến thể sẵn sàng');
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(variantId, 1);
      toast.success('Đã thêm vào giỏ hàng');
      refreshHeaderCounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      return;
    }

    const variantId = product.variants && product.variants.length > 0 
      ? product.variants[0].id 
      : null;

    if (!variantId) {
      toast.error('Sản phẩm này chưa có biến thể sẵn sàng');
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(variantId, 1);
      refreshHeaderCounts();
      navigate('/checkout', { state: { selectedVariantIds: [variantId] } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể mua ngay');
    } finally {
      setAddingToCart(false);
    }
  };
  
  return (
    <div className="group flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="shrink-0">
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

      <div className="flex flex-col flex-1 gap-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 flex-wrap mb-2">
          {product.brandName && (
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
              {product.brandName}
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

        <div 
          className="text-sm text-slate-600 line-clamp-2 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description || '' }}
        />

        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Giá từ</span>
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
              disabled={addingToCart || product.stock <= 0}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 font-bold shadow-md shadow-indigo-100"
              onClick={handleBuyNow}
              disabled={addingToCart || product.stock <= 0}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}