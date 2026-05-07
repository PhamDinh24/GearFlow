import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { AdminNav } from "./AdminNav";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "./ui/dialog";
import { Search, AlertTriangle, CheckCircle, Edit, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { productApi } from "../services/api";
import { variantService } from "../services/variantService";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";

interface InventoryItem {
  variantId: string;
  productId: string;
  productName: string;
  imageUrl?: string;
  switchType?: string;
  color?: string;
  keycapSet?: string;
  connectionType?: string;
  stock: number;
  finalPrice: number;
}

export function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'instock' | 'out'>('all');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts(0, 1000);
      const products = Array.isArray(data) ? data : data.content || [];

      const inventoryItems: InventoryItem[] = [];
      for (const product of products) {
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            inventoryItems.push({
              variantId: variant.id,
              productId: product.id,
              productName: product.name,
              imageUrl: product.imageUrl,
              switchType: variant.switchType,
              color: variant.color,
              keycapSet: variant.keycapSet,
              connectionType: variant.connectionType,
              stock: variant.stock || 0,
              finalPrice: variant.finalPrice || product.basePrice,
            });
          }
        } else {
          // Product without variants - show as single item
          inventoryItems.push({
            variantId: product.id,
            productId: product.id,
            productName: product.name,
            imageUrl: product.imageUrl,
            stock: product.stock || 0,
            finalPrice: product.basePrice,
          });
        }
      }
      setItems(inventoryItems);
    } catch (err) {
      toast.error("Không thể tải dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStock = (item: InventoryItem) => {
    setEditingItem(item);
    setNewStock(item.stock);
  };

  const handleSaveStock = async () => {
    if (!editingItem) return;
    try {
      setSaving(true);
      await variantService.updateStock(editingItem.variantId, newStock);
      toast.success("Đã cập nhật tồn kho");
      setEditingItem(null);
      await loadInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật tồn kho");
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.switchType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.color || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filterStatus === 'all' ||
      (filterStatus === 'out' && item.stock === 0) ||
      (filterStatus === 'low' && item.stock > 0 && item.stock < 5) ||
      (filterStatus === 'instock' && item.stock >= 5);
    return matchSearch && matchFilter;
  });

  const {
    currentPage, totalPages, paginatedItems, goToPage,
    canGoNext, canGoPrevious, startIndex, endIndex, totalItems,
  } = usePagination({ items: filtered, itemsPerPage: 12 });

  const totalStock = items.reduce((s, i) => s + i.stock, 0);
  const lowStockCount = items.filter(i => i.stock > 0 && i.stock < 5).length;
  const outOfStockCount = items.filter(i => i.stock === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản lý tồn kho</h1>
            <p className="text-slate-500 mt-1">Theo dõi và cập nhật tồn kho biến thể sản phẩm</p>
          </div>
          <Button onClick={loadInventory} variant="outline" className="rounded-xl gap-2">
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng số lượng</p>
                <p className="text-3xl font-bold">{totalStock.toLocaleString('vi-VN')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sắp hết hàng (&lt;5)</p>
                <p className="text-3xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hết hàng</p>
                <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm, màu sắc, switch..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'instock', 'low', 'out'] as const).map(s => (
                  <Button
                    key={s}
                    variant={filterStatus === s ? 'default' : 'outline'}
                    onClick={() => setFilterStatus(s)}
                    size="sm"
                    className="rounded-lg"
                  >
                    {s === 'all' ? 'Tất cả' : s === 'instock' ? 'Còn hàng' : s === 'low' ? 'Sắp hết' : 'Hết hàng'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tồn kho ({filtered.length} biến thể)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[260px]">Sản phẩm</TableHead>
                    <TableHead>Switch</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Keycap</TableHead>
                    <TableHead>Kết nối</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map(item => (
                      <TableRow key={item.variantId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <span className="font-medium text-sm line-clamp-2">{item.productName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{item.switchType || '—'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{item.color || '—'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{item.keycapSet || '—'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{item.connectionType || '—'}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {item.finalPrice.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${item.stock === 0 ? 'text-red-600' : item.stock < 5 ? 'text-orange-600' : 'text-slate-700'}`}>
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.stock === 0 ? (
                            <Badge variant="destructive">Hết hàng</Badge>
                          ) : item.stock < 5 ? (
                            <Badge className="bg-orange-100 text-orange-800">Sắp hết</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Còn hàng</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStock(item)}
                            className="rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
          </CardContent>
        </Card>
      </div>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Cập nhật tồn kho</DialogTitle>
            <DialogDescription>
              {editingItem?.productName}
              {editingItem?.color && ` · ${editingItem.color}`}
              {editingItem?.switchType && ` · ${editingItem.switchType}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block text-sm font-medium">Số lượng tồn kho</Label>
            <Input
              type="number"
              value={newStock}
              onChange={e => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
              min={0}
              className="rounded-xl text-lg font-semibold"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              Tồn kho hiện tại: <span className="font-semibold">{editingItem?.stock}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)} className="rounded-xl">Hủy</Button>
            <Button
              onClick={handleSaveStock}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </div>
              ) : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
