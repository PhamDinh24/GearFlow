import { useState } from "react";
import { mockCategories, Category } from "../data/mockData";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "./ui/dialog";
import { Plus, Edit, Trash2, Search, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";
import { mockProducts } from "../data/mockData";

export function AdminCategories() {
  const categoriesWithCounts = mockCategories.map(cat => ({
    ...cat,
    productCount: mockProducts.filter(p => 
      p.category === cat.name || 
      p.layout === cat.name ||
      p.connectOptions?.some(co => co.type === cat.name) ||
      p.switchOptions?.some(so => so.brand === cat.name)
    ).length
  }));

  const [categories, setCategories] = useState<Category[]>(categoriesWithCounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "", type: "layout" as Category['type'] });
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const filtered = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchStatus = statusFilter === "all" || 
      (statusFilter === "active" && c.isActive) ||
      (statusFilter === "inactive" && !c.isActive);
    return matchSearch && matchType && matchStatus;
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

  const typeGroups = {
    layout: { label: "Layout bàn phím", color: "bg-blue-100 text-blue-700" },
    connection: { label: "Kết nối", color: "bg-purple-100 text-purple-700" },
    switch: { label: "Loại Switch", color: "bg-amber-100 text-amber-700" },
  };

  const handleToggle = (id: string) => {
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
    const cat = categories.find(c => c.id === id);
    toast.success(cat?.isActive ? "Đã tắt danh mục" : "Đã kích hoạt danh mục");
  };

  const handleEditOpen = (cat: Category) => {
    setEditItem(cat);
    setEditForm({ name: cat.name, description: cat.description });
  };

  const handleEditSave = () => {
    if (editItem) {
      setCategories(prev => prev.map(c =>
        c.id === editItem.id ? { ...c, ...editForm } : c
      ));
      setEditItem(null);
      toast.success("Đã cập nhật danh mục");
    }
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success("Đã xóa danh mục");
  };

  const handleAdd = () => {
    const newCat: Category = {
      id: `cat${Date.now()}`,
      ...addForm,
      isActive: true,
      productCount: 0,
    };
    setCategories(prev => [...prev, newCat]);
    setAddForm({ name: "", description: "", type: "layout" });
    setShowAdd(false);
    toast.success("Đã thêm danh mục mới");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-slate-900">Bảo trì danh mục</h1>
              <HelpTooltip 
                title="Quản lý danh mục" 
                content="Quản lý các thuộc tính phân loại sản phẩm:
                • Phân loại: Hệ thống chia làm 3 nhóm chính: Layout, Kết nối và Loại Switch.
                • Kích hoạt/Tắt: Sử dụng công tắc Toggle để ẩn hoặc hiện danh mục ngoài cửa hàng.
                • Số SP: Thống kê số lượng sản phẩm đang thuộc danh mục này.
                • Chỉnh sửa/Xóa: Thay đổi tên, mô tả hoặc xóa bỏ các danh mục không còn sử dụng."
              />
            </div>
            <p className="text-slate-500 mt-1">Quản lý các nhóm phân loại sản phẩm</p>
          </div>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </Button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[{ key: "all", label: "Tất cả" }, { key: "layout", label: "Layout" }, { key: "connection", label: "Kết nối" }, { key: "switch", label: "Switch" }].map(t => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs opacity-75">
                ({t.key === "all" ? categories.length : categories.filter(c => c.type === t.key).length})
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl h-11"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-11">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã tắt</SelectItem>
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
                  <TableHead>Loại</TableHead>
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
                      <p className="truncate">{cat.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeGroups[cat.type]?.color || "bg-slate-100 text-slate-600"}>
                        {typeGroups[cat.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{cat.productCount}</TableCell>
                    <TableCell>
                      <button onClick={() => handleToggle(cat.id)} className="flex items-center gap-1.5">
                        {cat.isActive ? (
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
            <DialogDescription>Cập nhật thông tin danh mục sản phẩm</DialogDescription>
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
            <DialogDescription>Tạo danh mục sản phẩm mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tên danh mục</Label>
              <Input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="VD: 75%" className="rounded-xl" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Loại</Label>
              <div className="flex gap-2">
                {(['layout', 'connection', 'switch'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddForm({ ...addForm, type: t })}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                      addForm.type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t === 'layout' ? 'Layout' : t === 'connection' ? 'Kết nối' : 'Switch'}
                  </button>
                ))}
              </div>
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
    </div>
  );
}
