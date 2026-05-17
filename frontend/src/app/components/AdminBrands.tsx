import { useState } from "react";
import { mockBrands, Brand } from "../data/mockData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { AdminNav } from "./AdminNav";
import { HelpTooltip } from "./common/HelpTooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "./ui/dialog";
import { Plus, Edit, Trash2, Search, Globe, ToggleLeft, ToggleRight, Package, Tag } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import { mockProducts } from "../data/mockData";

export function AdminBrands() {
  const brandsWithCounts = mockBrands.map(brand => ({
    ...brand,
    productCount: mockProducts.filter(p => p.brand === brand.name).length
  }));
  
  const [brands, setBrands] = useState<Brand[]>(brandsWithCounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", country: "", website: "" });
  const [addForm, setAddForm] = useState({ name: "", description: "", country: "", website: "" });

  const filtered = brands.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCountry = filterCountry === "all" || b.country === filterCountry;
    return matchSearch && matchCountry;
  }).sort((a, b) => {
    switch (sortBy) {
      case "count-desc": return b.productCount - a.productCount;
      case "count-asc": return a.productCount - b.productCount;
      case "name-desc": return b.name.localeCompare(a.name);
      default: return a.name.localeCompare(b.name);
    }
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBrands,
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

  const countryFlag: Record<string, string> = {
    'Việt Nam': '🇻🇳',
    'Đức': '🇩🇪',
    'Trung Quốc': '🇨🇳',
    'Hồng Kông': '🇭🇰',
    'Nhật Bản': '🇯🇵',
    'Mỹ': '🇺🇸',
  };

  const handleToggle = (id: string) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
    const brand = brands.find(b => b.id === id);
    toast.success(brand?.isActive ? "Đã tắt thương hiệu" : "Đã kích hoạt thương hiệu");
  };

  const handleEditOpen = (brand: Brand) => {
    setEditItem(brand);
    setEditForm({ name: brand.name, description: brand.description, country: brand.country, website: brand.website || "" });
  };

  const handleEditSave = () => {
    if (editItem) {
      setBrands(prev => prev.map(b => b.id === editItem.id ? { ...b, ...editForm } : b));
      setEditItem(null);
      toast.success("Đã cập nhật thương hiệu");
    }
  };

  const handleDelete = (id: string) => {
    const brand = brands.find(b => b.id === id);
    if (brand && brand.productCount > 0) {
      toast.error("Không thể xóa thương hiệu đang có sản phẩm");
      return;
    }
    setBrands(prev => prev.filter(b => b.id !== id));
    toast.success("Đã xóa thương hiệu");
  };

  const handleAdd = () => {
    if (!addForm.name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }
    const newBrand: Brand = {
      id: `b${Date.now()}`,
      ...addForm,
      isActive: true,
      productCount: 0,
    };
    setBrands(prev => [...prev, newBrand]);
    setAddForm({ name: "", description: "", country: "", website: "" });
    setShowAdd(false);
    toast.success("Đã thêm thương hiệu mới");
  };

  const activeCount = brands.filter(b => b.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-slate-900">Bảo trì thương hiệu</h1>
              <HelpTooltip 
                title="Quản lý thương hiệu" 
                content="Công cụ quản lý danh sách các đối tác/hãng sản xuất:
                • Thêm mới: Tạo hồ sơ thương hiệu với thông tin Quốc gia và Website.
                • Kích hoạt/Tắt: Quyết định việc hiển thị thương hiệu và sản phẩm của hãng trên hệ thống.
                • Website: Liên kết trực tiếp đến trang chủ của hãng để khách hàng tham khảo.
                • Ràng buộc: Không thể xóa thương hiệu nếu vẫn còn sản phẩm thuộc hãng đó trong kho."
              />
            </div>
            <p className="text-slate-500 mt-1">Quản lý thông tin các hãng sản xuất bàn phím</p>
          </div>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Thêm thương hiệu
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-slate-900">{brands.length}</p>
            <p className="text-sm text-slate-500 mt-1">Tổng thương hiệu</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-sm text-slate-500 mt-1">Đang hoạt động</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:col-span-1 col-span-2">
            <p className="text-3xl font-bold text-indigo-600">{[...new Set(brands.map(b => b.country))].length}</p>
            <p className="text-sm text-slate-500 mt-1">Quốc gia</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm thương hiệu, quốc gia..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl h-11"
              />
            </div>
            
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-11">
                <SelectValue placeholder="Quốc gia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả quốc gia</SelectItem>
                {[...new Set(brands.map(b => b.country))].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-11">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Tên A-Z</SelectItem>
                <SelectItem value="name-desc">Tên Z-A</SelectItem>
                <SelectItem value="count-desc">Sản phẩm (Nhiều nhất)</SelectItem>
                <SelectItem value="count-asc">Sản phẩm (Ít nhất)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Danh sách thương hiệu ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead>Quốc gia</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Số SP</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBrands.map(brand => (
                  <TableRow key={brand.id} className={`hover:bg-slate-50 ${!brand.isActive ? 'opacity-70' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-bold text-slate-600">
                          {brand.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{brand.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{countryFlag[brand.country] || '🌐'}</span>
                        <span className="text-sm text-slate-600">{brand.country}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-xs">
                      <p className="truncate">{brand.description}</p>
                    </TableCell>
                    <TableCell>
                      {brand.website ? (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm">
                          <Globe className="w-4 h-4" />
                          Link
                        </a>
                      ) : (
                        <span className="text-slate-300 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {brand.productCount}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleToggle(brand.id)} className="flex items-center gap-1.5">
                        {brand.isActive ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm text-emerald-700 font-medium">Hoạt động</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-500">Tắt</span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditOpen(brand)} className="rounded-lg hover:bg-indigo-50 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(brand.id)} className="rounded-lg hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thương hiệu</DialogTitle>
            <DialogDescription>Cập nhật thông tin thương hiệu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Tên thương hiệu</Label>
                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Quốc gia</Label>
                <Input value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Website</Label>
              <Input value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} placeholder="https://..." className="rounded-xl" />
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
            <Button variant="outline" onClick={() => setEditItem(null)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleEditSave} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm thương hiệu mới</DialogTitle>
            <DialogDescription>Tạo thương hiệu sản phẩm mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Tên thương hiệu *</Label>
                <Input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Cherry" className="rounded-xl" />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Quốc gia</Label>
                <Input value={addForm.country} onChange={e => setAddForm({ ...addForm, country: e.target.value })} placeholder="Đức" className="rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Website</Label>
              <Input value={addForm.website} onChange={e => setAddForm({ ...addForm, website: e.target.value })} placeholder="https://..." className="rounded-xl" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Mô tả</Label>
              <textarea
                value={addForm.description}
                onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                placeholder="Mô tả về thương hiệu..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
