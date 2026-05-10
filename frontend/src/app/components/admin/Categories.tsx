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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../ui/dialog";
import { Plus, Edit, Trash2, Search, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { categoryApi } from "../../services/api";
import { CategoryDTO } from "../../app/types";
import { usePagination } from "../../hooks/usePagination";
import { DataPagination } from "../ui/data-pagination";

export function Categories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<CategoryDTO | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách danh mục");
    }
  };

  const filtered = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedCategories,
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
    toast.success("Chức năng khóa danh mục hiện chưa hỗ trợ qua API");
  };

  const handleEditOpen = (cat: CategoryDTO) => {
    setEditItem(cat);
    setEditForm({ name: cat.name, description: cat.description || "" });
  };

  const handleEditSave = async () => {
    if (editItem) {
      try {
        const updated = await categoryApi.updateCategory(editItem.id, editForm);
        setCategories(prev => prev.map(c =>
          c.id === editItem.id ? updated : c
        ));
        setEditItem(null);
        toast.success("Đã cập nhật danh mục");
      } catch (error) {
        toast.error("Lỗi cập nhật danh mục");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa danh mục?")) return;
    try {
      await categoryApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Đã xóa danh mục");
    } catch (error) {
      toast.error("Không thể xóa danh mục");
    }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    try {
      const newCat = await categoryApi.createCategory(addForm);
      setCategories(prev => [...prev, newCat]);
      setAddForm({ name: "", description: "" });
      setShowAdd(false);
      toast.success("Đã thêm danh mục mới");
    } catch (error) {
      toast.error("Lỗi thêm danh mục");
    }
  };

  return (
    <AdminPageWrapper title="" description="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bảo trì danh mục</h1>
            <p className="text-slate-500 mt-1">Quản lý các nhóm phân loại sản phẩm</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Danh sách danh mục ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Số SP</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCategories.map(cat => (
                  <TableRow key={cat.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-xs">
                      <p className="truncate">{cat.description || 'Chưa có mô tả'}</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold">0</TableCell>
                    <TableCell>
                      <button onClick={() => handleToggle(cat.id)} className="flex items-center gap-1.5">
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm text-emerald-700 font-medium">Hoạt động</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditOpen(cat)} className="rounded-lg hover:bg-indigo-50 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="rounded-lg hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên danh mục</Label>
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
            <DialogTitle>Thêm danh mục mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên danh mục</Label>
              <Input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Tên..." className="rounded-xl" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Mô tả</Label>
              <textarea
                value={addForm.description}
                onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                placeholder="Mô tả ngắn về danh mục..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}
