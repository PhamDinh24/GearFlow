import { useState, useEffect } from "react";
import { AdminPageWrapper } from "./PageWrapper";
import { brandApi } from "../../services/api";
import { BrandDTO } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Plus, Edit, Trash2, Search, Tag } from "lucide-react";
import { toast } from "sonner";

export function Brands() {
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandDTO | null>(null);
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandApi.getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error loading brands:", error);
      toast.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBrand(null);
    setBrandForm({ name: "", description: "" });
    setShowDialog(true);
  };

  const handleEdit = (brand: BrandDTO) => {
    setEditingBrand(brand);
    setBrandForm({ name: brand.name, description: brand.description || "" });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!brandForm.name.trim()) {
        toast.error("Vui lòng nhập tên thương hiệu");
        return;
      }

      if (editingBrand) {
        const updated = await brandApi.updateBrand(editingBrand.id, brandForm);
        setBrands(prev => prev.map(b => b.id === editingBrand.id ? updated : b));
        toast.success("Cập nhật thương hiệu thành công");
      } else {
        const created = await brandApi.createBrand(brandForm);
        setBrands(prev => [created, ...prev]);
        toast.success("Tạo thương hiệu thành công");
      }
      
      setShowDialog(false);
    } catch (error: any) {
      console.error("Error saving brand:", error);
      toast.error(error.message || "Không thể lưu thương hiệu");
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm("Bạn có chắc muốn xóa thương hiệu này?")) return;

    try {
      setBrands(prev => prev.filter(b => b.id !== brandId));
      await brandApi.deleteBrand(brandId);
      toast.success("Xóa thương hiệu thành công");
    } catch (error: any) {
      console.error("Error deleting brand:", error);
      toast.error(error.message || "Không thể xóa thương hiệu");
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper 
      title="Quản Lý Thương Hiệu" 
      description="Quản lý các thương hiệu sản phẩm trong hệ thống"
    >
      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Thương Hiệu</p>
              <p className="text-2xl font-bold">{brands.length}</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Thương Hiệu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Thương Hiệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-lg">{brand.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {brand.description || "Không có mô tả"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBrands.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? "Không tìm thấy thương hiệu nào" : "Chưa có thương hiệu nào. Click 'Thêm Thương Hiệu' để tạo mới."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Chỉnh Sửa Thương Hiệu" : "Thêm Thương Hiệu Mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin thương hiệu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brandName">Tên Thương Hiệu *</Label>
              <Input
                id="brandName"
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                placeholder="VD: Keychron, Logitech, Razer..."
              />
            </div>
            <div>
              <Label htmlFor="brandDescription">Mô Tả</Label>
              <Textarea
                id="brandDescription"
                value={brandForm.description}
                onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                placeholder="Mô tả về thương hiệu"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingBrand ? "Cập Nhật" : "Tạo Mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}

