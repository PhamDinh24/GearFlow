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
import { BrandDTO } from "../../app/types";

export function Brands() {
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<BrandDTO | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [addForm, setAddForm] = useState({ name: "", description: "" });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await brandApi.getBrands();
      setBrands(data);
    } catch (error) {
      toast.error("Lỗi tải danh sách thương hiệu");
    }
  };

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    if (!confirm("Xác nhận xóa?")) return;
    try {
      await brandApi.deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
      toast.success("Đã xóa thương hiệu");
    } catch (error) {
      toast.error("Không thể xóa thương hiệu");
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
    <AdminPageWrapper title="" description="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bảo trì thương hiệu</h1>
            <p className="text-slate-500 mt-1">Quản lý thông tin các hãng sản xuất bàn phím</p>
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

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(brand => (
            <div key={brand.id} className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition-shadow border-slate-200`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-600">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{brand.name}</h3>
                  </div>
                </div>
                <button onClick={() => handleToggle(brand.id)} className="mt-1">
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">{brand.description || 'Chưa có mô tả'}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Package className="w-4 h-4" />
                    <span>0 sản phẩm</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditOpen(brand)} className="rounded-lg h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(brand.id)} className="rounded-lg h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
    </AdminPageWrapper>
  );
}
