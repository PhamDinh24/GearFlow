import { useState, useEffect } from "react";
import { attributeApi } from "../../services/api";
import { AttributeDefinitionDTO } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { usePagination } from "../../hooks/usePagination";
import { DataPagination } from "../ui/data-pagination";
import { ConfirmDialog } from "../common/ConfirmDialog";

export function AttributeDefinitions() {
  const [attributes, setAttributes] = useState<AttributeDefinitionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAttr, setEditingAttr] = useState<AttributeDefinitionDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [form, setForm] = useState<Partial<AttributeDefinitionDTO>>({
    name: "",
    displayName: "",
    type: "STRING",
    unit: "",
    filterable: false,
    variantAttribute: false,
    displayOrder: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const data = await attributeApi.getAllAttributes();
      setAttributes(data);
    } catch (e) {
      toast.error("Không thể tải danh sách thuộc tính");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!form.name || !form.displayName) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (editingAttr) {
        const updated = await attributeApi.updateAttribute(editingAttr.id, form);
        setAttributes(prev => prev.map(a => a.id === editingAttr.id ? updated : a));
        toast.success("Cập nhật thành công");
      } else {
        const created = await attributeApi.createAttribute(form);
        setAttributes(prev => [...prev, created].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        toast.success("Thêm mới thành công");
      }
      setShowDialog(false);
    } catch (e: any) {
      toast.error(e.message || "Lỗi khi lưu thuộc tính");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    try {
      setAttributes(prev => prev.filter(a => a.id !== id));
      await attributeApi.deleteAttribute(id);
      toast.success("Đã xóa thuộc tính thành công");
    } catch (e) {
      toast.error("Không thể xóa thuộc tính");
      loadAttributes();
    } finally {
      setDeleteConfirm({ open: false, id: "" });
    }
  };

  const filtered = attributes.filter(a => 
    (a.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || a.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (typeFilter === "ALL" || a.type === typeFilter)
  );

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedAttributes,
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

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình thuộc tính...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cấu Hình Thuộc Tính</h2>
          <p className="text-sm text-gray-500">Quản lý các trường thông tin kỹ thuật cho sản phẩm</p>
        </div>
        <Button onClick={() => {
          setEditingAttr(null);
          setForm({ name: "", displayName: "", type: "STRING", unit: "", filterable: false, variantAttribute: false, displayOrder: attributes.length });
          setShowDialog(true);
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm Thuộc Tính
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm theo tên hoặc mã định danh..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-56 h-11">
            <SelectValue placeholder="Tất cả loại dữ liệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại dữ liệu</SelectItem>
            <SelectItem value="STRING">Chữ/Văn bản</SelectItem>
            <SelectItem value="NUMBER">Số liệu</SelectItem>
            <SelectItem value="BOOLEAN">Lựa chọn (Có/Không)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedAttributes.map(attr => (
          <Card key={attr.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-600 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{attr.displayName}</h3>
                  <div className="flex items-center gap-2">
                    <code className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">{attr.name}</code>
                    <span className="text-[10px] text-gray-400">#{attr.displayOrder}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingAttr(attr);
                    setForm(attr);
                    setShowDialog(true);
                  }} className="h-8 w-8 p-0"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(attr.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50">
                  {attr.type === 'STRING' ? 'Văn bản' : attr.type === 'NUMBER' ? 'Số' : 'Boolean'}
                </Badge>
                {attr.unit && <Badge variant="secondary" className="font-mono">Đơn vị: {attr.unit}</Badge>}
                {attr.filterable && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    Hiện bộ lọc
                  </Badge>
                )}
                {attr.variantAttribute && (
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                    Phân loại biến thể
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm border p-2">
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

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">Không tìm thấy thuộc tính nào phù hợp</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingAttr ? 'Cập Nhật Thuộc Tính' : 'Tạo Thuộc Tính Mới'}</DialogTitle>
            <DialogDescription>
              Thiết lập các trường thông tin kỹ thuật để dùng cho sản phẩm và bộ lọc.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="attr-id" className="font-semibold text-gray-700 text-sm">Mã định danh (ID) *</Label>
              <Input id="attr-id" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="vd: pin_capacity, switch_type..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attr-name" className="font-semibold text-gray-700 text-sm">Tên hiển thị *</Label>
              <Input id="attr-name" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} placeholder="vd: Dung lượng Pin, Loại Switch..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-gray-700 text-sm">Loại dữ liệu</Label>
                    <Select value={form.type} onValueChange={v => setForm({...form, type: v as any})}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STRING">Chữ/Văn bản</SelectItem>
                            <SelectItem value="NUMBER">Số liệu</SelectItem>
                            <SelectItem value="BOOLEAN">Có/Không</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-gray-700 text-sm">Đơn vị (nếu có)</Label>
                    <Input value={form.unit || ''} onChange={e => setForm({...form, unit: e.target.value})} placeholder="vd: mm, g, Hz..." />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-gray-700 text-sm">Thứ tự hiển thị</Label>
                <Input type="number" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={form.filterable} onChange={e => setForm({...form, filterable: e.target.checked})} />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Cho phép dùng làm bộ lọc tìm kiếm</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={form.variantAttribute} onChange={e => setForm({...form, variantAttribute: e.target.checked})} />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Dùng để phân loại thuộc tính biến thể</span>
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1 sm:flex-none">Hủy</Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700">Lưu Thông Tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa thuộc tính"
        description="Bạn có chắc chắn muốn xóa thuộc tính này? Hành động này sẽ gỡ bỏ định nghĩa dữ liệu và có thể ảnh hưởng đến các sản phẩm đang sử dụng nó."
        type="danger"
        confirmText="Xóa thuộc tính"
      />
    </div>
  );
}