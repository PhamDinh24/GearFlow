import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AdminPageWrapper } from './PageWrapper';
import { adminApi, userApi, productApi } from '../../services/api';
import { OrderDTO, UserDTO, ProductDTO } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Search, ShoppingCart, Package, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; status: string } | null>(null);

  const getUserName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u?.username || u?.email || userId.substring(0, 8) + '...';
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [data, usersData, productsData] = await Promise.all([
        adminApi.getAllOrders(),
        userApi.getAllUsers(),
        productApi.getProducts(0, 1000)
      ]);
      setOrders(data);
      setUsers(usersData);
      setProducts(Array.isArray(productsData) ? productsData : (productsData.content || []));
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: OrderDTO) => {
    setSelectedOrder(order);
    setShowDialog(true);
  };

  const confirmStatusChange = (orderId: string, newStatus: string) => {
    setPendingStatusChange({ orderId, status: newStatus });
    setShowConfirmDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!pendingStatusChange) return;

    const { orderId, status } = pendingStatusChange;
    
    try {
      setUpdatingStatus(orderId);
      await adminApi.updateOrderStatus(orderId, status);
      toast.success('Cập nhật trạng thái thành công');
      
      // Update the local state
      setOrders(orders.map(o => o.id === orderId ? {...o, status} : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({...selectedOrder, status});
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái';
      toast.error(errorMsg);
    } finally {
      setUpdatingStatus(null);
      setShowConfirmDialog(false);
      setPendingStatusChange(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const userName = getUserName(order.userId).toLowerCase();
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED' || o.status === 'SHIPPED').length,
    completed: orders.filter(o => o.status === 'DELIVERED').length,
    // Revenue only from DELIVERED orders
    revenue: orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳ Chờ xử lý';
      case 'CONFIRMED': return '✓ Đã xác nhận';
      case 'PROCESSING': return '📦 Đang xử lý';
      case 'SHIPPED': return '🚚 Đang giao';
      case 'DELIVERED': return '✅ Hoàn thành';
      case 'CANCELLED': return '❌ Đã hủy';
      default: return status;
    }
  };

  const getValidNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED'];
      case 'PROCESSING':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      case 'DELIVERED':
        return [];
      case 'CANCELLED':
        return [];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper 
      title="Quản Lý Đơn Hàng" 
      description="Theo dõi và xử lý đơn hàng của khách hàng"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng Đơn Hàng</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chờ Xử Lý</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang Xử Lý</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Doanh Thu</p>
                <p className="text-2xl font-bold">{(stats.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Đơn Hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hoặc khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded px-4 py-2 min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPED">Đang giao</option>
              <option value="DELIVERED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Mã Đơn</th>
                  <th className="text-left p-4 font-semibold">Khách Hàng</th>
                  <th className="text-left p-4 font-semibold">Tổng Tiền</th>
                  <th className="text-left p-4 font-semibold">Trạng Thái</th>
                  <th className="text-left p-4 font-semibold">Ngày Đặt</th>
                  <th className="text-left p-4 font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-blue-600 font-medium">{order.id}</td>
                    <td className="p-4 font-medium">{getUserName(order.userId)}</td>
                    <td className="p-4 font-semibold">{order.totalAmount?.toLocaleString('vi-VN')}đ</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        Chi Tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Không tìm thấy đơn hàng nào' 
                : 'Chưa có đơn hàng nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="order-dialog-description">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đơn Hàng</DialogTitle>
            <DialogDescription id="order-dialog-description">
              Xem chi tiết và cập nhật trạng thái đơn hàng
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã Đơn Hàng</p>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khách Hàng</p>
                  <p className="font-semibold">{getUserName(selectedOrder.userId)}</p>
                  <p className="text-xs text-gray-400 font-mono">{selectedOrder.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày Đặt</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng Tiền</p>
                  <p className="text-xl font-bold">{selectedOrder.totalAmount?.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Trạng Thái Đơn Hàng</p>
                <div className="flex flex-wrap gap-2">
                  {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => {
                    const isValidTransition = getValidNextStatuses(selectedOrder.status).includes(status) || selectedOrder.status === status;
                    return (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedOrder.status === status ? 'default' : 'outline'}
                        disabled={!isValidTransition || updatingStatus === selectedOrder.id}
                        onClick={() => status !== selectedOrder.status ? confirmStatusChange(selectedOrder.id, status) : null}
                      >
                        {getStatusLabel(status)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Sản Phẩm Trong Đơn</h3>
                <div className="border rounded">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Hình ảnh</th>
                        <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Sản Phẩm</th>
                        <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Số Lượng</th>
                        <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Đơn Giá</th>
                        <th className="text-left p-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any, index: number) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <tr key={index} className="border-t hover:bg-gray-50/50 transition-colors">
                            <td className="p-3">
                              <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden border border-gray-100">
                                <img 
                                  src={product?.imageUrl || 'https://via.placeholder.com/50'} 
                                  className="w-full h-full object-cover" 
                                  alt="" 
                                />
                              </div>
                            </td>
                            <td className="p-3 font-medium text-gray-900">{item.productName || item.productId}</td>
                            <td className="p-3 font-semibold">{item.quantity}</td>
                            <td className="p-3 text-gray-600">{item.price?.toLocaleString('vi-VN')}đ</td>
                            <td className="p-3 font-bold text-blue-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setShowDialog(false)}>Đóng</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent aria-describedby="confirm-dialog-description">
          <DialogHeader>
            <DialogTitle>Xác Nhận Yêu Cầu</DialogTitle>
            <DialogDescription id="confirm-dialog-description">
              Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng thành "{getStatusLabel(pendingStatusChange?.status || '')}"?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <div className="flex-1 p-3 bg-blue-50 rounded flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Thay đổi trạng thái có thể ảnh hưởng đến:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email thông báo gửi cho khách hàng</li>
                  <li>Số lượng hàng được cấp lại (nếu hủy)</li>
                  <li>Thống kê doanh số</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Hủy</Button>
            <Button onClick={handleUpdateStatus} disabled={updatingStatus !== null}>
              {updatingStatus ? 'Đang cập nhật...' : 'Xác Nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
};
