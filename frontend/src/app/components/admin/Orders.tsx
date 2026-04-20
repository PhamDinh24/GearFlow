import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Pagination } from '../ui/pagination';
import { AdminPageWrapper } from './PageWrapper';
import { adminApi, userApi, productApi } from '../../services/api';
import { OrderDTO, UserDTO, ProductDTO } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Search, ShoppingCart, Package, TrendingUp, Clock, AlertCircle, FileSpreadsheet, FileText, File, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { 
  exportToExcel, 
  exportToPDF, 
  exportToWord,
  exportToExcelTable,
  formatDateForExport,
  formatCurrencyForExport,
  generateFilename
} from '../../utils/exportUtils';

const ITEMS_PER_PAGE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);

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
      
      // Sort orders by createdAt (newest first)
      const sortedOrders = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setOrders(sortedOrders);
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

  const exportToExcelHandler = () => {
    const metadata = {
      'Hệ thống': 'GearFlow Management',
      'Ngày xuất': formatDateForExport(new Date().toISOString()),
      'Người xuất': 'Administrator',
      'Tổng số': `${filteredOrders.length} đơn hàng`,
    };

    const headers = ['STT', 'Mã đơn hàng', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Số sản phẩm', 'Ngày đặt'];
    
    const data = filteredOrders.map((order, index) => [
      index + 1,
      order.id,
      getUserName(order.userId),
      formatCurrencyForExport(order.totalAmount || 0),
      getStatusLabel(order.status),
      order.items?.length || 0,
      formatDateForExport(order.createdAt),
    ]);

    const result = exportToExcelTable(
      'DANH SÁCH ĐƠN HÀNG',
      metadata,
      headers,
      data,
      generateFilename('danh-sach-don-hang')
    );
    
    if (result.success) {
      toast.success('Đã xuất file Excel thành công');
    } else {
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  const exportToPDFHandler = () => {
    const headers = ['Mã đơn hàng', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Số sản phẩm', 'Ngày đặt'];
    const data = filteredOrders.map((order) => [
      order.id,
      getUserName(order.userId),
      formatCurrencyForExport(order.totalAmount || 0),
      getStatusLabel(order.status),
      `${order.items?.length || 0} sản phẩm`,
      formatDateForExport(order.createdAt),
    ]);

    const result = exportToPDF(
      'Danh Sách Đơn Hàng',
      headers,
      data,
      generateFilename('danh-sach-don-hang')
    );
    
    if (result.success) {
      toast.success('Đã xuất file PDF thành công');
    } else {
      toast.error('Lỗi khi xuất file PDF');
    }
  };

  const exportToWordHandler = async () => {
    const headers = ['Mã đơn hàng', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Số sản phẩm', 'Ngày đặt'];
    const data = filteredOrders.map((order) => [
      order.id,
      getUserName(order.userId),
      formatCurrencyForExport(order.totalAmount || 0),
      getStatusLabel(order.status),
      `${order.items?.length || 0} sản phẩm`,
      formatDateForExport(order.createdAt),
    ]);

    const result = await exportToWord(
      'Danh Sách Đơn Hàng',
      headers,
      data,
      generateFilename('danh-sach-don-hang')
    );
    
    if (result.success) {
      toast.success('Đã xuất file Word thành công');
    } else {
      toast.error('Lỗi khi xuất file Word');
    }
  };

  const filteredOrders = orders.filter(order => {
    const userName = getUserName(order.userId).toLowerCase();
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
      actions={(
        <>
          <Button onClick={loadOrders} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={exportToExcelHandler} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button onClick={exportToPDFHandler} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button onClick={exportToWordHandler} variant="outline">
            <File className="w-4 h-4 mr-2" />
            Xuất Word
          </Button>
        </>
      )}
    >
      {/* Stats Cards - Enhanced with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Tổng Đơn Hàng</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.total}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Tất cả đơn hàng</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-yellow-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Chờ Xử Lý</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.pending}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Cần xác nhận</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '45%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Đang Xử Lý</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.processing}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Đang giao hàng</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '60%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-green-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Doanh Thu</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{(stats.revenue / 1000000).toFixed(1)}M</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">{stats.revenue.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table - Enhanced */}
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Danh Sách Đơn Hàng</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">{filteredOrders.length} đơn hàng</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
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
              className="border rounded-lg px-4 py-2 min-w-[180px] bg-white hover:border-blue-400 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">⏳ Chờ xử lý</option>
              <option value="CONFIRMED">✓ Đã xác nhận</option>
              <option value="PROCESSING">📦 Đang xử lý</option>
              <option value="SHIPPED">🚚 Đang giao</option>
              <option value="DELIVERED">✅ Hoàn thành</option>
              <option value="CANCELLED">❌ Đã hủy</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Mã Đơn</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Khách Hàng</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Tổng Tiền</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Trạng Thái</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Ngày Đặt</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                        <span className="font-mono text-sm text-blue-600 font-bold group-hover:text-blue-700">{order.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                          {getUserName(order.userId).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{getUserName(order.userId)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(order.status)} font-bold shadow-sm`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-600 font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</div>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all font-medium"
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
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Không tìm thấy đơn hàng nào' 
                  : 'Chưa có đơn hàng nào'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
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
