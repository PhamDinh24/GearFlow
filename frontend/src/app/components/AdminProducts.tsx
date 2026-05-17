import { useState } from "react";
import { mockProducts, Product } from "../data/mockData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { AdminNav } from "./AdminNav";
import { HelpTooltip } from "./common/HelpTooltip";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "./ui/dialog";
import { Search, Plus, Edit, Eye, EyeOff, Package, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLayout, setFilterLayout] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", basePrice: 0, stock: 0, brand: "", description: "" });

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLayout = filterLayout === "all" || p.layout === filterLayout;
    const matchStatus = filterStatus === "all" || 
      (filterStatus === "active" && p.isActive !== false) ||
      (filterStatus === "inactive" && p.isActive === false);
    
    const matchStock = filterStock === "all" ||
      (filterStock === "out" && p.stock === 0) ||
      (filterStock === "low" && p.stock > 0 && p.stock < 10) ||
      (filterStock === "available" && p.stock >= 10);
      
    const matchPrice = filterPrice === "all" ||
      (filterPrice === "low" && p.basePrice < 1000000) ||
      (filterPrice === "mid" && p.basePrice >= 1000000 && p.basePrice < 3000000) ||
      (filterPrice === "high" && p.basePrice >= 3000000);

    return matchSearch && matchLayout && matchStatus && matchStock && matchPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-asc": return a.basePrice - b.basePrice;
      case "price-desc": return b.basePrice - a.basePrice;
      case "stock-asc": return a.stock - b.stock;
      case "stock-desc": return b.stock - a.stock;
      case "name-desc": return b.name.localeCompare(a.name);
      default: return a.name.localeCompare(b.name);
    }
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

  const handleEditOpen = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      basePrice: product.basePrice,
      stock: product.stock,
      brand: product.brand,
      description: product.description,
    });
  };

  const handleEditSave = () => {
    if (editingProduct) {
      setProducts(prev => prev.map(p =>
        p.id === editingProduct.id ? { ...p, ...editForm } : p
      ));
      setEditingProduct(null);
      toast.success("Đã cập nhật thông tin sản phẩm");
    }
  };

  const handleToggleActive = (id: string) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, isActive: p.isActive === false ? true : false } : p
    ));
    const product = products.find(p => p.id === id);
    toast.success(product?.isActive === false ? "Đã kích hoạt sản phẩm" : "Đã ẩn sản phẩm");
  };

  const totalValue = products.reduce((s, p) => s + p.basePrice * p.stock, 0);
  const activeCount = products.filter(p => p.isActive !== false).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-slate-900">Bảo trì sản phẩm</h1>
            <HelpTooltip 
              title="Quản lý sản phẩm" 
              content="Công cụ quản lý danh mục sản phẩm của hệ thống:
              • Thêm sản phẩm: Tạo mới sản phẩm với thông tin cơ bản và giá niêm yết.
              • Chỉnh sửa: Cập nhật tên, giá, số lượng tồn kho hoặc mô tả sản phẩm.
              • Hiển thị/Ẩn: Sử dụng icon con mắt để cho phép hoặc không cho phép sản phẩm xuất hiện ngoài cửa hàng.
              • Theo dõi tồn kho: Kiểm tra số lượng còn lại để kịp thời nhập hàng."
            />
          </div>
          <p className="text-slate-500 mt-1">Quản lý và duy trì thông tin sản phẩm</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {[
            { label: "Tổng sản phẩm", value: products.length, icon: Package, color: "bg-blue-100 text-blue-600" },
            { label: "Đang hiển thị", value: activeCount, icon: Eye, color: "bg-green-100 text-green-600" },
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

        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl h-11"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-11">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                  <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                  <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                  <SelectItem value="stock-asc">Tồn kho tăng dần</SelectItem>
                  <SelectItem value="stock-desc">Tồn kho giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={filterLayout} onValueChange={setFilterLayout}>
                <SelectTrigger className="w-[140px] rounded-xl h-10 bg-slate-50 border-none text-xs font-bold">
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
                <SelectTrigger className="w-[140px] rounded-xl h-10 bg-slate-50 border-none text-xs font-bold">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hiển thị</SelectItem>
                  <SelectItem value="inactive">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger className="w-[140px] rounded-xl h-10 bg-slate-50 border-none text-xs font-bold">
                  <SelectValue placeholder="Tồn kho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tồn kho</SelectItem>
                  <SelectItem value="out">Hết hàng (0)</SelectItem>
                  <SelectItem value="low">Sắp hết hàng (&lt;10)</SelectItem>
                  <SelectItem value="available">Còn hàng (≥10)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPrice} onValueChange={setFilterPrice}>
                <SelectTrigger className="w-[140px] rounded-xl h-10 bg-slate-50 border-none text-xs font-bold">
                  <SelectValue placeholder="Mức giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức giá</SelectItem>
                  <SelectItem value="low">Dưới 1M</SelectItem>
                  <SelectItem value="mid">1M - 3M</SelectItem>
                  <SelectItem value="high">Trên 3M</SelectItem>
                </SelectContent>
              </Select>

              {(filterLayout !== "all" || filterStatus !== "all" || filterStock !== "all" || filterPrice !== "all" || searchQuery !== "") && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setFilterLayout("all");
                    setFilterStatus("all");
                    setFilterStock("all");
                    setFilterPrice("all");
                    setSearchQuery("");
                  }}
                  className="h-10 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
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
                        <img src={product.imageUrl || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge className="bg-slate-100 text-slate-700 text-xs py-0">{product.brandId}</Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.layout}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{product.brand}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {product.basePrice.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${product.stock < 5 ? 'text-orange-600' : 'text-slate-700'}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.isActive === false ? (
                        <Badge className="bg-slate-100 text-slate-600">Đã ẩn</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Hiển thị</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditOpen(product)} className="rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(product.id)}
                          className={`rounded-lg ${product.isActive === false ? 'text-green-600 hover:bg-green-50' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                          {product.isActive === false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>Cập nhật thông tin sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên sản phẩm</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Thương hiệu</Label>
              <Input value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label className="mb-1.5 block text-sm font-medium">Tồn kho</Label>
                <Input
                  type="number"
                  value={editForm.stock}
                  onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleEditSave} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>Tạo sản phẩm mới trong hệ thống</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên sản phẩm</Label>
              <Input placeholder="Nhập tên sản phẩm" className="rounded-xl" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Thương hiệu</Label>
              <Input placeholder="Nhập thương hiệu" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Giá cơ bản (đ)</Label>
                <Input type="number" placeholder="0" className="rounded-xl" />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Layout</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {['60%', '65%', '75%', 'TKL', 'Full-size'].map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Mô tả</Label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                placeholder="Nhập mô tả sản phẩm..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={() => { setShowAddModal(false); toast.success("Đã thêm sản phẩm mới"); }} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              Thêm sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
