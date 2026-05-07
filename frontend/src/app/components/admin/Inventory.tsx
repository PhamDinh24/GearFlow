import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { AdminPageWrapper } from "./PageWrapper";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../ui/dialog";
import { 
  Search, 
  AlertTriangle,
  CheckCircle,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/adminService";

interface StockItem {
  variantId: string;
  productId: string;
  productName: string;
  variantDetails: string;
  quantity: number;
  reserved: number;
  available: number;
  updatedAt: string;
}

export function Inventory() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'instock'>('all');
  
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockForm, setStockForm] = useState({ quantity: 0, reserved: 0 });

  useEffect(() => {
    loadStock();
  }, [searchQuery]);

  const loadStock = async () => {
    try {
      const response = await adminService.getAllStock(0, 100, searchQuery);
      setStockItems(response.content || []);
    } catch (error) {
      toast.error('Không thể tải thông tin kho hàng');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem) return;
    try {
      await adminService.updateStock(
        selectedItem.variantId, 
        stockForm.quantity, 
        stockForm.reserved
      );
      await loadStock();
      setSelectedItem(null);
      toast.success('Đã cập nhật tồn kho');
    } catch (error) {
      toast.error('Không thể cập nhật tồn kho');
    }
  };

  const handleEditStock = (item: StockItem) => {
    setSelectedItem(item);
    setStockForm({
      quantity: item.quantity,
      reserved: item.reserved
    });
  };

  const filteredItems = stockItems.filter(item => {
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'low' && item.available < 5) ||
      (filterStatus === 'instock' && item.available >= 5);
    return matchesFilter;
  });

  const totalItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = stockItems.filter(item => item.available < 5).length;
  const totalValue = 0; // Mocked

  return (
    <AdminPageWrapper title="" description="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Quản lý kho hàng</h1>
          <p className="text-slate-500 mt-1">Kiểm soát số lượng và tình trạng sản phẩm</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng số lượng</p>
                  <p className="text-3xl font-bold">{totalItems}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sản phẩm sắp hết</p>
                  <p className="text-3xl font-bold text-orange-600">{lowStockCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Giá trị tồn kho</p>
                  <p className="text-3xl font-bold">{(totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filterStatus === 'low' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('low')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Sắp hết
                </Button>
                <Button
                  variant={filterStatus === 'instock' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('instock')}
                >
                  Còn hàng
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách sản phẩm ({filteredItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Sản phẩm</TableHead>
                    <TableHead>Tùy chọn</TableHead>
                    <TableHead className="text-right">Tồn kho</TableHead>
                    <TableHead className="text-right">Đã đặt</TableHead>
                    <TableHead className="text-right">Có sẵn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.variantId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-500">
                            {item.productName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{item.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {item.variantDetails}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-amber-600">
                        {item.reserved}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.available < 5 ? 'text-orange-600 font-bold' : 'font-semibold'}>
                          {item.available}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.available === 0 ? (
                          <Badge variant="destructive">Hết hàng</Badge>
                        ) : item.available < 5 ? (
                          <Badge className="bg-orange-100 text-orange-800">Sắp hết</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Còn hàng</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditStock(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật tồn kho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Tổng tồn kho</Label>
              <Input
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                min="0"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Đã đặt hàng</Label>
              <Input
                type="number"
                value={stockForm.reserved}
                onChange={(e) => setStockForm({ ...stockForm, reserved: Number(e.target.value) })}
                min="0"
                max={stockForm.quantity}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleUpdateStock} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}