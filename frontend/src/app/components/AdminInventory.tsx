import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiService } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

interface StockItem {
  variantId: string;
  productName: string;
  variantDetails: string;
  quantity: number;
  reserved: number;
  available: number;
}

export const AdminInventory: React.FC = () => {
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newQuantity, setNewQuantity] = useState(0);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const products = await apiService.getProducts();
      
      const stockItems: StockItem[] = [];
      for (const product of products.content || []) {
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            stockItems.push({
              variantId: variant.id,
              productName: product.name,
              variantDetails: `${variant.switchType || ''} ${variant.color || ''}`.trim(),
              quantity: variant.stock || 0,
              reserved: 0,
              available: variant.stock || 0
            });
          }
        } else {
          stockItems.push({
            variantId: product.id,
            productName: product.name,
            variantDetails: 'Mặc định',
            quantity: product.stock || 0,
            reserved: 0,
            available: product.stock || 0
          });
        }
      }
      
      setInventory(stockItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem) return;
    
    try {
      await apiService.updateStock(selectedItem.variantId, newQuantity);
      setShowDialog(false);
      loadInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Lỗi khi cập nhật tồn kho');
    }
  };

  const handleOpenDialog = (item: StockItem) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity);
    setShowDialog(true);
  };

  const filteredInventory = inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.variantDetails.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = filteredInventory.filter(item => item.available < 10);
  const outOfStockItems = filteredInventory.filter(item => item.available === 0);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Quản Lý Kho Hàng</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Tổng Sản Phẩm</p>
            <p className="text-3xl font-bold">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Sắp Hết Hàng</p>
            <p className="text-3xl font-bold text-yellow-600">{lowStockItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Hết Hàng</p>
            <p className="text-3xl font-bold text-red-600">{outOfStockItems.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Sản Phẩm</th>
                  <th className="text-left p-4">Biến Thể</th>
                  <th className="text-left p-4">Tồn Kho</th>
                  <th className="text-left p-4">Đã Đặt</th>
                  <th className="text-left p-4">Khả Dụng</th>
                  <th className="text-left p-4">Trạng Thái</th>
                  <th className="text-left p-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.variantId} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.productName}</td>
                    <td className="p-4 text-gray-600">{item.variantDetails}</td>
                    <td className="p-4">{item.quantity}</td>
                    <td className="p-4">{item.reserved}</td>
                    <td className="p-4 font-semibold">{item.available}</td>
                    <td className="p-4">
                      {item.available === 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Hết hàng
                        </span>
                      ) : item.available < 10 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Sắp hết
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Còn hàng
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenDialog(item)}
                      >
                        Cập Nhật
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Update Stock Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập Nhật Tồn Kho</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Sản Phẩm</p>
                <p className="font-medium">{selectedItem.productName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Biến Thể</p>
                <p>{selectedItem.variantDetails}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tồn Kho Hiện Tại</p>
                <p className="text-xl font-bold">{selectedItem.quantity}</p>
              </div>
              <div>
                <Label>Số Lượng Mới</Label>
                <Input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateStock}>
                  Cập Nhật
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
