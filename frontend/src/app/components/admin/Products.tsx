import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { AdminPageWrapper } from "./PageWrapper";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "../ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "../ui/tabs";
import { Search, Plus, Edit, Eye, EyeOff, Package, TrendingUp, Info, Trash2, Camera, Loader2, ToggleRight, ToggleLeft } from "lucide-react";
import { imageService } from "../../services/imageService";
import { toast } from "sonner";
import { productApi } from "../../services/api";
import { variantService } from "../../services/variantService";
import { productService } from "../../services/productService";
import { ProductDTO } from "../../app/types";
import { usePagination } from "../../hooks/usePagination";
import { DataPagination } from "../ui/data-pagination";
import api from "../../services/http";

interface CategoryOption { id: string; name: string; }
interface BrandOption { id: string; name: string; }

const LAYOUT_OPTIONS = ['60%', '65%', '70%', '75%', '80%', 'TKL', 'Full-size', 'Custom'];
const CONNECTION_OPTIONS = ['Wired', 'Wireless', 'Bluetooth', 'Tri-mode'];

const defaultAddForm = {
  name: "",
  description: "",
  basePrice: 0,
  categoryId: "",
  brandId: "",
  layout: "",
  connectionType: "",
  active: true,
};

export function Products() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLayout, setFilterLayout] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ProductDTO | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(defaultAddForm);
  const [addLoading, setAddLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [editForm, setEditForm] = useState({ 
    name: "", 
    basePrice: 0, 
    stock: 0, 
    brand: "", 
    description: "", 
    categoryId: "",
    layout: "",
    connectionType: "",
    active: true
  });
  
  // Variant management states
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [addingVariant, setAddingVariant] = useState(false);
  const [variantForm, setVariantForm] = useState({
    switchType: "",
    color: "",
    keycapSet: "",
    connectionType: "",
    priceModifier: 0,
    stock: 0,
  });

  useEffect(() => {
    loadProducts();
    loadCategoriesAndBrands();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productApi.getProducts(0, 1000);
      setProducts(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      toast.error("Lỗi tải danh sách sản phẩm");
    }
  };

  const loadCategoriesAndBrands = async () => {
    try {
      const [cats, brnds] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
      ]);
      setCategories(cats);
      setBrands(brnds);
    } catch (err) {
      console.error("Failed to load categories/brands", err);
    }
  };

  const handleAddProduct = async () => {
    if (!addForm.name.trim()) { toast.error("Vui lòng nhập tên sản phẩm"); return; }
    if (!addForm.categoryId) { toast.error("Vui lòng chọn danh mục"); return; }
    if (!addForm.brandId) { toast.error("Vui lòng chọn thương hiệu"); return; }
    if (addForm.basePrice <= 0) { toast.error("Giá phải lớn hơn 0"); return; }

    try {
      setAddLoading(true);
      await api.post('/products/admin', {
        name: addForm.name,
        description: addForm.description,
        basePrice: addForm.basePrice,
        categoryId: addForm.categoryId,
        brandId: addForm.brandId,
        layout: addForm.layout,
        connectionType: addForm.connectionType,
        active: addForm.active
      });
      toast.success("Đã thêm sản phẩm mới");
      setShowAddModal(false);
      setAddForm(defaultAddForm);
      await loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể thêm sản phẩm");
    } finally {
      setAddLoading(false);
    }
  };

  // Variant management functions
  const handleUpdateVariant = async () => {
    if (!editingVariant || !viewingProduct) return;
    
    try {
      await variantService.updateVariant(editingVariant.id, {
        switchType: variantForm.switchType || undefined,
        color: variantForm.color || undefined,
        keycapSet: variantForm.keycapSet || undefined,
        connectionType: variantForm.connectionType || undefined,
        priceModifier: variantForm.priceModifier,
        stock: variantForm.stock,
      });
      
      toast.success('Cập nhật biến thể thành công');
      setEditingVariant(null);
      
      // Reload product to get updated data
      const updatedProduct = await productApi.getProductById(viewingProduct.id);
      setViewingProduct(updatedProduct);
      await loadProducts();
    } catch (error: any) {
      console.error('Failed to update variant:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật biến thể');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Bạn có chắc muốn xóa biến thể này?')) return;
    if (!viewingProduct) return;
    
    try {
      await variantService.deleteVariant(variantId);
      toast.success('Đã xóa biến thể');
      
      // Reload product
      const updatedProduct = await productApi.getProductById(viewingProduct.id);
      setViewingProduct(updatedProduct);
      await loadProducts();
    } catch (error: any) {
      console.error('Failed to delete variant:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa biến thể');
    }
  };

  const handleAddVariant = async () => {
    if (!viewingProduct) return;
    
    try {
      await variantService.createVariant(viewingProduct.id, {
        switchType: variantForm.switchType || undefined,
        color: variantForm.color || undefined,
        keycapSet: variantForm.keycapSet || undefined,
        connectionType: variantForm.connectionType || undefined,
        priceModifier: variantForm.priceModifier,
        stock: variantForm.stock,
      });
      
      toast.success('Thêm biến thể thành công');
      setAddingVariant(false);
      setVariantForm({
        switchType: "",
        color: "",
        keycapSet: "",
        connectionType: "",
        priceModifier: 0,
        stock: 0,
      });
      
      // Reload product
      const updatedProduct = await productApi.getProductById(viewingProduct.id);
      setViewingProduct(updatedProduct);
      await loadProducts();
    } catch (error: any) {
      console.error('Failed to add variant:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm biến thể');
    }
  };

  // Calculate total stock from all variants
  const calculateTotalStock = (product: ProductDTO) => {
    return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  const handleToggleActive = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    try {
      await api.put(`/products/admin/${productId}`, {
        active: product.active === false
      });
      toast.success(`Đã ${product.active === false ? 'hiển thị' : 'ẩn'} sản phẩm`);
      await loadProducts();
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái sản phẩm");
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLayout = filterLayout === "all" || p.layout === filterLayout;
    const matchStatus = filterStatus === "all" || 
      (filterStatus === "active" && p.active !== false) ||
      (filterStatus === "inactive" && p.active === false);
    return matchSearch && matchLayout && matchStatus;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    items: filtered,
    itemsPerPage: 12,
  });

  const handleEditOpen = (product: ProductDTO) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      basePrice: product.basePrice,
      stock: product.stock,
      brand: product.brandId,
      description: product.description,
      categoryId: product.categoryId,
      layout: product.layout || "",
      connectionType: product.connectionType || "",
      active: product.active !== false
    });
  };

  const handleEditSave = async () => {
    if (editingProduct) {
      try {
        await api.put(`/products/admin/${editingProduct.id}`, {
          name: editForm.name,
          basePrice: editForm.basePrice,
          description: editForm.description,
          categoryId: editForm.categoryId || editingProduct.categoryId,
          brandId: editForm.brand || editingProduct.brandId,
          layout: editForm.layout,
          connectionType: editForm.connectionType,
          active: editForm.active
        });
        await loadProducts();
        setEditingProduct(null);
        toast.success("Đã cập nhật thông tin sản phẩm");
      } catch (err) {
        toast.error("Lỗi cập nhật sản phẩm");
      }
    }
  };

  const totalValue = products.reduce((s, p) => s + p.basePrice * p.stock, 0);
  const activeCount = products.filter(p => p.active !== false).length;

  return (
    <>
      <AdminPageWrapper 
      title="Bảo trì sản phẩm" 
      description="Quản lý và duy trì thông tin sản phẩm"
      helpContent="Công cụ quản lý danh mục sản phẩm của hệ thống:
        • Thêm sản phẩm: Tạo mới sản phẩm với thông tin cơ bản và giá niêm yết.
        • Quản lý biến thể: Click icon thông tin (Info) để quản lý Switch, Màu sắc và Tồn kho chi tiết cho từng loại.
        • Hiển thị/Ẩn: Sử dụng icon Toggle để quyết định sản phẩm có xuất hiện ngoài cửa hàng hay không.
        • Cập nhật ảnh: Click vào ảnh trong chế độ Chỉnh sửa để tải ảnh mới lên."
      actions={
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 shadow-md h-11 px-6"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Thêm sản phẩm</span>
        </Button>
      }
    >
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {[
            { label: "Tổng sản phẩm", value: products.length, icon: Package, color: "bg-blue-100 text-blue-600" },
            { label: "Đang hiển thị", value: activeCount, icon: ToggleRight, color: "bg-green-100 text-green-600" },
            { label: "Giá trị hàng hoá", value: `${(totalValue / 1000000).toFixed(1)}M đ`, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={filterLayout} onValueChange={setFilterLayout}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả layout</SelectItem>
                {['60%', '65%', '75%', 'TKL', 'Full-size'].map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hiển thị</SelectItem>
                <SelectItem value="inactive">Đã ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Danh sách sản phẩm ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[280px]">Sản phẩm</TableHead>
                  <TableHead>Layout</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead className="text-right">Giá cơ bản</TableHead>
                  <TableHead className="text-right">Tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map(product => (
                  <TableRow key={product.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.layout || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{brands.find(b => b.id === product.brandId)?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {product.basePrice.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${calculateTotalStock(product) < 5 ? 'text-orange-600' : 'text-slate-700'}`}>
                          {calculateTotalStock(product)}
                        </span>
                        {product.variants && product.variants.length > 0 && (
                          <span className="text-xs text-slate-500">
                            ({product.variants.length} biến thể)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.active === false ? (
                        <Badge className="bg-slate-100 text-slate-600">Đã ẩn</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Hiển thị</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewingProduct(product)} 
                          className="rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditOpen(product)} className="rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(product.id)}
                          className={`rounded-lg ${product.active !== false ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}
                          title={product.active !== false ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                        >
                          {product.active !== false ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </div>
    </AdminPageWrapper>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>Cập nhật thông tin sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Image Upload Section */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="w-40 h-40 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {editingProduct?.imageUrl ? (
                    <img src={editingProduct.imageUrl} alt={editingProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Tải ảnh lên</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && editingProduct) {
                        try {
                          const imageUrl = await imageService.uploadProductImage(editingProduct.id, file);
                          setEditingProduct({ ...editingProduct, imageUrl });
                          toast.success('Đã cập nhật ảnh sản phẩm');
                          loadProducts(); // Refresh list
                        } catch (error) {
                          toast.error('Không thể tải ảnh lên');
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên sản phẩm</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Danh mục</Label>
                <Select value={editForm.categoryId} onValueChange={v => setEditForm({ ...editForm, categoryId: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Thương hiệu</Label>
                <Select value={editForm.brand} onValueChange={v => setEditForm({ ...editForm, brand: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Layout</Label>
                <Select value={editForm.layout} onValueChange={v => setEditForm({ ...editForm, layout: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_OPTIONS.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Giá cơ bản (đ)</Label>
              <Input
                type="number"
                value={editForm.basePrice}
                onChange={e => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Mô tả</Label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Trạng thái hiển thị</Label>
              <Select 
                value={editForm.active ? "true" : "false"} 
                onValueChange={v => setEditForm({ ...editForm, active: v === "true" })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Công khai (Hiển thị cho khách hàng)</SelectItem>
                  <SelectItem value="false">Riêng tư (Ẩn khỏi khách hàng)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleEditSave} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Detail Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={() => setViewingProduct(null)}>
        <DialogContent className="rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>Xem thông tin chi tiết và biến thể sản phẩm</DialogDescription>
          </DialogHeader>
          
          {viewingProduct && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="variants">Biến thể ({viewingProduct.variants?.length || 0})</TabsTrigger>
                <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
              </TabsList>

              {/* Tab: Thông tin cơ bản */}
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Tên sản phẩm</Label>
                    <p className="text-slate-900 font-semibold mt-1">{viewingProduct.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">ID</Label>
                    <p className="text-slate-900 font-mono text-xs mt-1">{viewingProduct.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Giá cơ bản</Label>
                    <p className="text-slate-900 font-bold mt-1">{viewingProduct.basePrice.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Tồn kho</Label>
                    <p className="text-slate-900 font-bold mt-1">
                      {calculateTotalStock(viewingProduct)}
                      {viewingProduct.variants && viewingProduct.variants.length > 0 && (
                        <span className="text-sm text-slate-500 font-normal ml-2">
                          (từ {viewingProduct.variants.length} biến thể)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Danh mục</Label>
                    <p className="text-slate-900 mt-1">{categories.find(c => c.id === viewingProduct.categoryId)?.name || viewingProduct.categoryId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Thương hiệu</Label>
                    <p className="text-slate-900 mt-1">{brands.find(b => b.id === viewingProduct.brandId)?.name || viewingProduct.brandId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Đánh giá trung bình</Label>
                    <p className="text-slate-900 mt-1">{viewingProduct.averageRating?.toFixed(1) || 'N/A'} ⭐</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Số đánh giá</Label>
                    <p className="text-slate-900 mt-1">{viewingProduct.reviewCount || 0}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Mô tả</Label>
                  <p className="text-slate-700 mt-1 leading-relaxed">{viewingProduct.description}</p>
                </div>
                {viewingProduct.imageUrl && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600 mb-2 block">Hình ảnh</Label>
                    <img 
                      src={viewingProduct.imageUrl} 
                      alt={viewingProduct.name} 
                      className="w-full max-w-md rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </TabsContent>

              {/* Tab: Biến thể */}
              <TabsContent value="variants" className="mt-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Danh sách biến thể</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Tổng tồn kho: <span className="font-bold text-slate-900">{calculateTotalStock(viewingProduct)}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setAddingVariant(true);
                      setVariantForm({
                        switchType: "",
                        color: "",
                        keycapSet: "",
                        connectionType: "",
                        priceModifier: 0,
                        stock: 0,
                      });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm biến thể
                  </Button>
                </div>

                {viewingProduct.variants && viewingProduct.variants.length > 0 ? (
                  <div className="space-y-3">
                    {viewingProduct.variants.map((variant, index) => (
                      <div key={variant.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">Biến thể #{index + 1}</h4>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{variant.id}</p>
                          </div>
                          <Badge className={variant.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {variant.inStock ? `Còn ${variant.stock}` : 'Hết hàng'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          {variant.switchType && (
                            <div>
                              <span className="text-slate-600">Switch:</span>
                              <span className="ml-2 font-medium text-slate-900">{variant.switchType}</span>
                            </div>
                          )}
                          {variant.color && (
                            <div>
                              <span className="text-slate-600">Màu sắc:</span>
                              <span className="ml-2 font-medium text-slate-900">{variant.color}</span>
                            </div>
                          )}
                          {variant.keycapSet && (
                            <div>
                              <span className="text-slate-600">Keycap:</span>
                              <span className="ml-2 font-medium text-slate-900">{variant.keycapSet}</span>
                            </div>
                          )}
                          {variant.connectionType && (
                            <div>
                              <span className="text-slate-600">Kết nối:</span>
                              <span className="ml-2 font-medium text-slate-900">{variant.connectionType}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-600">Giá:</span>
                            <span className="ml-2 font-bold text-indigo-600">{(variant.finalPrice || 0).toLocaleString('vi-VN')}đ</span>
                          </div>
                          {variant.priceModifier !== 0 && (
                            <div>
                              <span className="text-slate-600">Điều chỉnh giá:</span>
                              <span className={`ml-2 font-semibold ${(variant.priceModifier || 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {(variant.priceModifier || 0) > 0 ? '+' : ''}{(variant.priceModifier || 0).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-slate-200">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingVariant(variant);
                              setVariantForm({
                                switchType: variant.switchType || "",
                                color: variant.color || "",
                                keycapSet: variant.keycapSet || "",
                                connectionType: variant.connectionType || "",
                                priceModifier: variant.priceModifier || 0,
                                stock: variant.stock || 0,
                              });
                            }}
                            className="flex-1 rounded-xl"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 flex-1 rounded-xl"
                            onClick={() => handleDeleteVariant(variant.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-xl">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Sản phẩm chưa có biến thể nào</p>
                    <Button
                      onClick={() => {
                        setAddingVariant(true);
                        setVariantForm({
                          switchType: "",
                          color: "",
                          keycapSet: "",
                          connectionType: "",
                          priceModifier: 0,
                          stock: 0,
                        });
                      }}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm biến thể đầu tiên
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Tab: Thuộc tính */}
              <TabsContent value="attributes" className="mt-4">
                {viewingProduct.attributes && viewingProduct.attributes.length > 0 ? (
                  <div className="space-y-3">
                    {viewingProduct.attributes.map((attr, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Tên thuộc tính</Label>
                            <p className="text-slate-900 font-semibold mt-1">{attr.name || attr.attrName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Giá trị</Label>
                            <p className="text-slate-900 mt-1">{attr.value || attr.attrValue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Sản phẩm chưa có thuộc tính nào</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingProduct(null)} className="rounded-xl">Đóng</Button>
            <Button 
              onClick={() => {
                setViewingProduct(null);
                if (viewingProduct) handleEditOpen(viewingProduct);
              }} 
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddModal} onOpenChange={open => { setShowAddModal(open); if (!open) setAddForm(defaultAddForm); }}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>Tạo sản phẩm mới trong hệ thống</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên sản phẩm *</Label>
              <Input
                value={addForm.name}
                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="VD: Keychron K2 V2"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Danh mục *</Label>
                <Select value={addForm.categoryId} onValueChange={v => setAddForm({ ...addForm, categoryId: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Thương hiệu *</Label>
                <Select value={addForm.brandId} onValueChange={v => setAddForm({ ...addForm, brandId: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Layout</Label>
                <Select value={addForm.layout} onValueChange={v => setAddForm({ ...addForm, layout: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_OPTIONS.map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Giá cơ bản (đ) *</Label>
              <Input
                type="number"
                value={addForm.basePrice || ""}
                onChange={e => setAddForm({ ...addForm, basePrice: Number(e.target.value) })}
                placeholder="VD: 1500000"
                className="rounded-xl"
                min={0}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Mô tả</Label>
              <textarea
                value={addForm.description}
                onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                placeholder="Nhập mô tả sản phẩm..."
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Trạng thái hiển thị</Label>
              <Select 
                value={addForm.active ? "true" : "false"} 
                onValueChange={v => setAddForm({ ...addForm, active: v === "true" })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Công khai (Hiển thị cho khách hàng)</SelectItem>
                  <SelectItem value="false">Riêng tư (Ẩn khỏi khách hàng)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl">Hủy</Button>
            <Button
              onClick={handleAddProduct}
              disabled={addLoading}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              {addLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang thêm...
                </div>
              ) : "Thêm sản phẩm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Variant Dialog */}
      <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
            <DialogDescription>Cập nhật thông tin và tồn kho biến thể</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Switch Type</Label>
                <Input
                  value={variantForm.switchType}
                  onChange={e => setVariantForm({...variantForm, switchType: e.target.value})}
                  className="rounded-xl"
                  placeholder="VD: Cherry MX Red"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Màu sắc</Label>
                <Input
                  value={variantForm.color}
                  onChange={e => setVariantForm({...variantForm, color: e.target.value})}
                  className="rounded-xl"
                  placeholder="VD: Đen"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Keycap Set</Label>
                <Input
                  value={variantForm.keycapSet}
                  onChange={e => setVariantForm({...variantForm, keycapSet: e.target.value})}
                  className="rounded-xl"
                  placeholder="VD: PBT Double Shot"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Kết nối</Label>
                <Select value={variantForm.connectionType} onValueChange={v => setVariantForm({...variantForm, connectionType: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn loại kết nối" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONNECTION_OPTIONS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Tồn kho</Label>
                <Input
                  type="number"
                  value={variantForm.stock}
                  onChange={e => setVariantForm({...variantForm, stock: parseInt(e.target.value) || 0})}
                  className="rounded-xl"
                  min="0"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Điều chỉnh giá (đ)</Label>
                <Input
                  type="number"
                  value={variantForm.priceModifier}
                  onChange={e => setVariantForm({...variantForm, priceModifier: parseInt(e.target.value) || 0})}
                  className="rounded-xl"
                  placeholder="0"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Số dương để tăng giá, số âm để giảm giá
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVariant(null)} className="rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleUpdateVariant} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Variant Dialog */}
      <Dialog open={addingVariant} onOpenChange={setAddingVariant}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm biến thể mới</DialogTitle>
            <DialogDescription>Tạo biến thể mới cho sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Switch Type</Label>
                <Input
                  value={variantForm.switchType}
                  onChange={e => setVariantForm({...variantForm, switchType: e.target.value})}
                  className="rounded-xl"
                  placeholder="VD: Cherry MX Red"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Màu sắc</Label>
                <Input
                  value={variantForm.color}
                  onChange={e => setVariantForm({...variantForm, color: e.target.value})}
                  className="rounded-xl"
                  placeholder="VD: Đen"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Keycap Set</Label>
                <Input
                  value={variantForm.keycapSet}
                  onChange={e => setVariantForm({...variantForm, keycapSet: e.target.value})}
                  className="rounded-xl"
                  placeholder="VD: PBT Double Shot"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Kết nối</Label>
                <Select value={variantForm.connectionType} onValueChange={v => setVariantForm({...variantForm, connectionType: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn loại kết nối" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONNECTION_OPTIONS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Tồn kho *</Label>
                <Input
                  type="number"
                  value={variantForm.stock}
                  onChange={e => setVariantForm({...variantForm, stock: parseInt(e.target.value) || 0})}
                  className="rounded-xl"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Điều chỉnh giá (đ)</Label>
                <Input
                  type="number"
                  value={variantForm.priceModifier}
                  onChange={e => setVariantForm({...variantForm, priceModifier: parseInt(e.target.value) || 0})}
                  className="rounded-xl"
                  placeholder="0"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Số dương để tăng giá, số âm để giảm giá
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingVariant(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button onClick={handleAddVariant} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              Thêm biến thể
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Edit Variant Dialog Component (add after the main component)

