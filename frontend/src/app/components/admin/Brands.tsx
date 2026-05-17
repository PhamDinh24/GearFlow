import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AdminPageWrapper } from "./PageWrapper";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../ui/dialog";
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight, Package } from "lucide-react";
import { toast } from "sonner";
import { brandApi } from "../../services/api";
import { BrandDTO, ProductDTO } from "../../app/types";
import { usePagination } from "../../hooks/usePagination";
import { DataPagination } from "../ui/data-pagination";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import { productApi } from "../../services/api/product.api";
import { ConfirmDialog } from "../common/ConfirmDialog";

export function Brands() {
  const [brands, setBrands] = useState<(BrandDTO & { productCount: number })[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<BrandDTO | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [addForm, setAddForm] = useState({ name: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const [brandData, productData] = await Promise.all([
        brandApi.getBrands(),
        productApi.getProducts(0, 1000) // Fetch large batch for counts
      ]);
      
      const brandsWithCounts = brandData.map(brand => ({
        ...brand,
        productCount: productData.content.filter(p => p.brandId === brand.id).length
      }));
      
      setBrands(brandsWithCounts);
      setProducts(productData.content);
    } catch (error) {
      toast.error("Lỗi tải danh sách thương hiệu");
    }
  };

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleToggle = (id: string) => {
    toast.success("Tính năng tạm khóa chưa hỗ trợ từ API");
  };

  const handleEditOpen = (brand: BrandDTO) => {
    setEditItem(brand);
    setEditForm({ name: brand.name, description: brand.description || "" });
  };

  const handleEditSave = async () => {
    if (editItem) {
      try {
        const updated = await brandApi.updateBrand(editItem.id, editForm);
        setBrands(prev => prev.map(b => b.id === editItem.id ? updated : b));
        setEditItem(null);
        toast.success("Đã cập nhật thương hiệu");
      } catch (error) {
        toast.error("Lỗi cập nhật thương hiệu");
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    try {
      await brandApi.deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
      toast.success("Đã xóa thương hiệu");
    } catch (error) {
      toast.error("Không thể xóa thương hiệu");
    } finally {
      setDeleteConfirm({ open: false, id: "" });
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }
    try {
      const newBrand = await brandApi.createBrand(addForm);
      setBrands(prev => [...prev, newBrand]);
      setAddForm({ name: "", description: "" });
      setShowAdd(false);
      toast.success("Đã thêm thương hiệu mới");
    } catch (error) {
      toast.error("Lỗi thêm thương hiệu");
    }
  };

  const activeCount = brands.length;

  return (
    <AdminPageWrapper 
      title="Bảo trì thương hiệu" 
      description="Quản lý thông tin các hãng sản xuất bàn phím"
      helpContent="Công cụ quản lý danh sách các đối tác/hãng sản xuất:
        • Thêm mới: Tạo hồ sơ thương hiệu với thông tin chi tiết.
        • Kích hoạt/Tắt: Quyết định việc hiển thị thương hiệu và sản phẩm của hãng trên hệ thống.
        • Ràng buộc: Lưu ý kiểm tra kỹ trước khi xóa thương hiệu nếu vẫn còn sản phẩm thuộc hãng đó trong kho."
      actions={
        <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 h-11 px-6 shadow-md">
          <Plus className="w-5 h-5" />
          <span className="font-bold">Thêm thương hiệu</span>
        </Button>
      }
    >
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
            <p className="text-3xl font-bold text-indigo-600">1</p>
            <p className="text-sm text-slate-500 mt-1">Quốc gia</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm thương hiệu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Danh sách thương hiệu ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Số SP</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBrands.map(brand => (
                  <TableRow key={brand.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-400">{brand.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-bold text-slate-600">
                          {brand.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{brand.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-xs">
                      <p className="truncate">{brand.description || 'Chưa có mô tả'}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                        {brand.productCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleToggle(brand.id)} className="flex items-center gap-1.5 group">
                        <ToggleRight className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-emerald-700 font-bold">Hoạt động</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditOpen(brand)} className="rounded-lg h-9 w-9 p-0 hover:bg-indigo-50 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(brand.id)} className="rounded-lg h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
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
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thương hiệu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên thương hiệu</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl" />
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
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên thương hiệu *</Label>
              <Input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Tên..." className="rounded-xl" />
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
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa thương hiệu"
        description="Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này sẽ ảnh hưởng đến các sản phẩm thuộc hãng này."
        type="danger"
        confirmText="Xóa thương hiệu"
      />
    </AdminPageWrapper>
  );
}
