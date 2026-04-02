import { useState, useEffect } from "react";
import { productApi, categoryApi, brandApi, stockApi } from "../../services/api";
import { ProductDTO, CategoryDTO, BrandDTO } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AdminPageWrapper } from "./PageWrapper";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "../ui/dialog";
import { Label } from "../ui/label";
import { 
  Search, 
  Plus, 
  Edit, 
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingDown
} from "lucide-react";
import { toast } from "sonner";

export function AdminProducts() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showDialog, setShowDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [newStock, setNewStock] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productApi.getProducts(0, 1000),
        categoryApi.getCategories(),
        brandApi.getBrands()
      ]);
      
      // Handle paginated response
      const productsData = Array.isArray(productsRes) ? productsRes : (productsRes.content || []);
      setProducts(productsData);
      setCategories(categoriesRes);
      setBrands(brandsRes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedVariant || newStock < 0) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    try {
      await stockApi.updateStock(selectedVariant.id, newStock);
      toast.success('Cập nhật tồn kho thành công');
      setShowStockDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast.error(error.message || 'Không thể cập nhật tồn kho');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const stats = {
    total: products.length,
    inStock: products.filter(p => {
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      return totalStock > 10;
    }).length,
    lowStock: products.filter(p => {
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      return totalStock > 0 && totalStock <= 10;
    }).length,
    outOfStock: products.filter(p => {
      const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
      return totalStock === 0;
    }).length,
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Hết hàng</Badge>;
    } else if (stock <= 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Sắp hết</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">Còn hàng</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper 
      title="Quản Lý Sản Phẩm" 
      description="Quản lý sản phẩm, biến thể và tồn kho"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng Sản Phẩm</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Còn Hàng</p>
                <p className="text-2xl font-bold">{stats.inStock}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp Hết</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hết Hàng</p>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh Sách Sản Phẩm</CardTitle>
            <Button onClick={() => { setEditingProduct(null); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Sản Phẩm
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded px-4 py-2 min-w-[200px]"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Sản Phẩm</th>
                  <th className="text-left p-4 font-semibold">Danh Mục</th>
                  <th className="text-left p-4 font-semibold">Thương Hiệu</th>
                  <th className="text-left p-4 font-semibold">Giá Gốc</th>
                  <th className="text-left p-4 font-semibold">Biến Thể</th>
                  <th className="text-left p-4 font-semibold">Tồn Kho</th>
                  <th className="text-left p-4 font-semibold">Trạng Thái</th>
                  <th className="text-left p-4 font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const category = categories.find(c => c.id === product.categoryId);
                  const brand = brands.find(b => b.id === product.brandId);
                  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0;
                  
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.imageUrl || 'https://via.placeholder.com/50'} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.support}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{category?.name || '-'}</td>
                      <td className="p-4">{brand?.name || '-'}</td>
                      <td className="p-4 font-semibold">{product.basePrice.toLocaleString('vi-VN')}đ</td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {product.variants?.length || 0} biến thể
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">{totalStock}</span>
                      </td>
                      <td className="p-4">
                        {getStockBadge(totalStock)}
                      </td>
                      <td className="p-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => { setEditingProduct(product); setShowDialog(true); }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || categoryFilter !== 'ALL' 
                ? 'Không tìm thấy sản phẩm nào' 
                : 'Chưa có sản phẩm nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Update Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent aria-describedby="stock-dialog-description">
          <DialogHeader>
            <DialogTitle>Cập Nhật Tồn Kho</DialogTitle>
            <DialogDescription id="stock-dialog-description">
              Nhập số lượng tồn kho mới cho biến thể
            </DialogDescription>
          </DialogHeader>
          {selectedVariant && (
            <div className="space-y-4">
              <div>
                <Label>Biến thể</Label>
                <div className="text-sm text-gray-600 mt-1">
                  {selectedVariant.color} - {selectedVariant.switchType}
                </div>
              </div>
              <div>
                <Label>Tồn kho hiện tại: {selectedVariant.availableStock ?? selectedVariant.stock ?? 0}</Label>
                <Input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>Hủy</Button>
            <Button onClick={handleUpdateStock}>Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Chi Tiết Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </DialogTitle>
            <DialogDescription id="product-dialog-description">
              {editingProduct ? 'Xem thông tin và cập nhật tồn kho' : 'Chức năng đang phát triển'}
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên sản phẩm</Label>
                  <div className="text-sm font-semibold mt-1">{editingProduct.name}</div>
                </div>
                <div>
                  <Label>Giá gốc</Label>
                  <div className="text-sm mt-1">{editingProduct.basePrice.toLocaleString('vi-VN')}đ</div>
                </div>
                <div>
                  <Label>Danh mục</Label>
                  <div className="text-sm mt-1">
                    {categories.find(c => c.id === editingProduct.categoryId)?.name || '-'}
                  </div>
                </div>
                <div>
                  <Label>Thương hiệu</Label>
                  <div className="text-sm mt-1">
                    {brands.find(b => b.id === editingProduct.brandId)?.name || '-'}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Biến Thể & Tồn Kho</Label>
                <div className="space-y-2 mt-3">
                  {editingProduct.variants && editingProduct.variants.length > 0 ? (
                    editingProduct.variants.map(variant => {
                      const stock = variant.availableStock ?? variant.stock ?? 0;
                      return (
                        <div key={variant.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {variant.color} - {variant.switchType}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Kết nối: {variant.connectType} | Keycap: {variant.keycapSet}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600">Tồn kho:</span>
                              <span className={`text-sm font-bold ${
                                stock === 0 ? 'text-red-600' : 
                                stock <= 10 ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                {stock}
                              </span>
                              {getStockBadge(stock)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVariant(variant);
                              setNewStock(stock);
                              setShowDialog(false);
                              setShowStockDialog(true);
                            }}
                          >
                            Cập nhật
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">Không có biến thể</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}

export { AdminProducts as Products };
