import { useState } from "react";
import { AdminPageWrapper } from "./PageWrapper";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Package,
  Tag,
  Users,
  ShoppingCart
} from "lucide-react";
import { productApi, adminApi, userApi, brandApi, categoryApi } from "../../services/api";
import { toast } from "sonner";

export function ImportExport() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Export Products
  const exportProducts = async () => {
    try {
      setExporting(true);
      const productsResponse = await productApi.getProducts(0, 1000);
      const products = productsResponse.content || [];
      
      const csvData = [
        ['ID', 'Tên', 'Mô Tả', 'Giá', 'Brand ID', 'Category ID', 'Ngày Tạo'],
        ...products.map(p => [
          p.id,
          p.name,
          p.description || '',
          p.basePrice,
          p.brandId || '',
          p.categoryId || '',
          p.createdAt || ''
        ])
      ];

      const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`Đã xuất ${products.length} sản phẩm`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất dữ liệu');
    } finally {
      setExporting(false);
    }
  };

  // Export Orders
  const exportOrders = async () => {
    try {
      setExporting(true);
      const orders = await adminApi.getAllOrders();
      
      const csvData = [
        ['ID', 'User ID', 'Tổng Tiền', 'Trạng Thái', 'Địa Chỉ', 'Thành Phố', 'SĐT', 'Ngày Tạo'],
        ...orders.map(o => [
          o.id,
          o.userId,
          o.totalAmount,
          o.status,
          o.shippingAddress || '',
          o.shippingCity || '',
          o.shippingPhone || '',
          o.createdAt || ''
        ])
      ];

      const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`Đã xuất ${orders.length} đơn hàng`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất dữ liệu');
    } finally {
      setExporting(false);
    }
  };

  // Export Users
  const exportUsers = async () => {
    try {
      setExporting(true);
      const users = await userApi.getAllUsers();
      
      const csvData = [
        ['ID', 'Username', 'Email', 'SĐT', 'Địa Chỉ', 'Vai Trò', 'Ngày Tạo'],
        ...users.map(u => [
          u.id,
          u.username,
          u.email || '',
          u.phone || '',
          u.address || '',
          u.role,
          u.createdAt || ''
        ])
      ];

      const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`Đã xuất ${users.length} người dùng`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất dữ liệu');
    } finally {
      setExporting(false);
    }
  };

  // Export Brands
  const exportBrands = async () => {
    try {
      setExporting(true);
      const brands = await brandApi.getBrands();
      
      const csvData = [
        ['ID', 'Tên', 'Mô Tả'],
        ...brands.map(b => [b.id, b.name, b.description || ''])
      ];

      const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `brands-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`Đã xuất ${brands.length} thương hiệu`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất dữ liệu');
    } finally {
      setExporting(false);
    }
  };

  // Export Categories
  const exportCategories = async () => {
    try {
      setExporting(true);
      const categories = await categoryApi.getCategories();
      
      const csvData = [
        ['ID', 'Tên', 'Mô Tả'],
        ...categories.map(c => [c.id, c.name, c.description || ''])
      ];

      const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`Đã xuất ${categories.length} danh mục`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi khi xuất dữ liệu');
    } finally {
      setExporting(false);
    }
  };

  // Import CSV (example for brands)
  const handleImportBrands = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const lines = text.split('\n').slice(1); // Skip header
      
      let successCount = 0;
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const [, name, description] = line.split(',').map(cell => 
          cell.replace(/^"|"$/g, '').trim()
        );
        
        if (name) {
          try {
            await brandApi.createBrand({ name, description: description || '' });
            successCount++;
          } catch (error) {
            console.error(`Error importing brand ${name}:`, error);
          }
        }
      }
      
      toast.success(`Đã nhập ${successCount} thương hiệu`);
      event.target.value = ''; // Reset input
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Lỗi khi nhập dữ liệu');
    } finally {
      setImporting(false);
    }
  };

  // Import Categories
  const handleImportCategories = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const lines = text.split('\n').slice(1); // Skip header
      
      let successCount = 0;
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const [, name, description] = line.split(',').map(cell => 
          cell.replace(/^"|"$/g, '').trim()
        );
        
        if (name) {
          try {
            await categoryApi.createCategory({ name, description: description || '' });
            successCount++;
          } catch (error) {
            console.error(`Error importing category ${name}:`, error);
          }
        }
      }
      
      toast.success(`Đã nhập ${successCount} danh mục`);
      event.target.value = ''; // Reset input
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Lỗi khi nhập dữ liệu');
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminPageWrapper
      title="Nhập / Xuất Dữ Liệu"
      description="Quản lý luân chuyển dữ liệu hệ thống thông qua tệp tin CSV"
      helpContent="Công cụ quản lý dữ liệu hàng loạt:
        • Xuất dữ liệu: Tải về toàn bộ danh sách Sản phẩm, Đơn hàng hoặc Khách hàng dưới định dạng CSV để lưu trữ hoặc báo cáo.
        • Nhập dữ liệu: Cho phép thêm nhanh nhiều Thương hiệu hoặc Danh mục cùng lúc bằng cách tải lên file CSV mẫu.
        • Mẫu CSV: Luôn tải và sử dụng File Mẫu trước khi nhập để đảm bảo cấu trúc dữ liệu chính xác.
        • Lưu ý: Việc nhập dữ liệu không đúng định dạng có thể gây lỗi hệ thống."
    >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Xuất Dữ Liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Xuất dữ liệu ra file CSV để sao lưu hoặc phân tích
              </p>

              <div className="space-y-3">
                <Button 
                  onClick={exportProducts} 
                  disabled={exporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Xuất Sản Phẩm
                </Button>

                <Button 
                  onClick={exportOrders} 
                  disabled={exporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Xuất Đơn Hàng
                </Button>

                <Button 
                  onClick={exportUsers} 
                  disabled={exporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Xuất Người Dùng
                </Button>

                <Button 
                  onClick={exportBrands} 
                  disabled={exporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Xuất Thương Hiệu
                </Button>

                <Button 
                  onClick={exportCategories} 
                  disabled={exporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Xuất Danh Mục
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Nhập Dữ Liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Nhập dữ liệu từ file CSV. File phải có định dạng đúng.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-brands">Nhập Thương Hiệu (CSV)</Label>
                  <Input
                    id="import-brands"
                    type="file"
                    accept=".csv"
                    onChange={handleImportBrands}
                    disabled={importing}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: ID, Tên, Mô Tả
                  </p>
                </div>

                <div>
                  <Label htmlFor="import-categories">Nhập Danh Mục (CSV)</Label>
                  <Input
                    id="import-categories"
                    type="file"
                    accept=".csv"
                    onChange={handleImportCategories}
                    disabled={importing}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: ID, Tên, Mô Tả
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Nhập dữ liệu sẽ tạo mới các bản ghi. 
                  Đảm bảo file CSV có định dạng đúng để tránh lỗi.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Downloads */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Tải Mẫu CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Tải file mẫu để biết định dạng CSV chuẩn
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const csv = '"ID","Tên","Mô Tả"\n"","Keychron","Thương hiệu bàn phím cơ"';
                  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'brands-template.csv';
                  link.click();
                }}
              >
                Mẫu Thương Hiệu
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const csv = '"ID","Tên","Mô Tả"\n"","Mechanical Keyboards","Bàn phím cơ"';
                  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'categories-template.csv';
                  link.click();
                }}
              >
                Mẫu Danh Mục
              </Button>
            </div>
          </CardContent>
        </Card>
    </AdminPageWrapper>
  );
}

