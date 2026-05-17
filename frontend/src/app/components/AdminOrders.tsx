import { useState, useEffect } from "react";
import { orderService, type Order } from "../services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { AdminNav } from "./AdminNav";
import { HelpTooltip } from "./common/HelpTooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Search, Eye, X, Package, MapPin, Phone, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DataPagination } from "./ui/data-pagination";
import { refreshHeaderCounts } from "../utils/events";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders(
        statusFilter === 'all' ? undefined : statusFilter
      );
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      loadOrders();
      refreshHeaderCounts();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    try {
      await orderService.adminCancelOrder(orderId);
      toast.success('Đã hủy đơn hàng');
      loadOrders();
      setSelectedOrder(null);
      refreshHeaderCounts();
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some(item => item.productName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.shippingFullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

    return matchesSearch && matchesPayment;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'total-desc': return b.totalAmount - a.totalAmount;
      case 'total-asc': return a.totalAmount - b.totalAmount;
      case 'date-asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedOrders,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    items: filteredOrders,
    itemsPerPage: 12,
  });

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURN_REQUESTED: 'bg-amber-100 text-amber-800',
      RETURN_CONFIRMED: 'bg-emerald-100 text-emerald-800',
      RETURN_INSPECTING: 'bg-cyan-100 text-cyan-800',
      RETURNED: 'bg-slate-200 text-slate-800',
      RETURN_REJECTED: 'bg-rose-100 text-rose-800',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Đang chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang chuẩn bị hàng',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Đã giao thành công',
      CANCELLED: 'Đã hủy',
      RETURN_REQUESTED: 'Yêu cầu trả hàng',
      RETURN_CONFIRMED: 'Đã xác nhận yêu cầu',
      RETURN_INSPECTING: 'Đang kiểm tra sản phẩm',
      RETURNED: 'Trả hàng thành công',
      RETURN_REJECTED: 'Từ chối trả hàng',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-3xl font-bold text-green-600">
                  {(totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đơn chờ xử lý</p>
                <p className="text-3xl font-bold text-orange-600">
                  {pendingOrders}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Tìm mã đơn, tên khách, sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Mới nhất</SelectItem>
                    <SelectItem value="date-asc">Cũ nhất</SelectItem>
                    <SelectItem value="total-desc">Giá trị (Cao → Thấp)</SelectItem>
                    <SelectItem value="total-asc">Giá trị (Thấp → Cao)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50 border-none text-xs font-bold">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Đang chờ xác nhận</SelectItem>
                    <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                    <SelectItem value="PROCESSING">Đang chuẩn bị hàng</SelectItem>
                    <SelectItem value="SHIPPED">Đang giao</SelectItem>
                    <SelectItem value="DELIVERED">Đã giao</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    <SelectItem value="RETURN_REQUESTED">Yêu cầu trả hàng</SelectItem>
                    <SelectItem value="RETURN_CONFIRMED">Đã xác nhận yêu cầu</SelectItem>
                    <SelectItem value="RETURN_INSPECTING">Đang kiểm tra SP</SelectItem>
                    <SelectItem value="RETURNED">Đã hoàn trả</SelectItem>
                    <SelectItem value="RETURN_REJECTED">Từ chối trả hàng</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50 border-none text-xs font-bold">
                    <SelectValue placeholder="Thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thanh toán</SelectItem>
                    <SelectItem value="COD">Tiền mặt (COD)</SelectItem>
                    <SelectItem value="VNPAY">Chuyển khoản (VNPay)</SelectItem>
                  </SelectContent>
                </Select>

                {(statusFilter !== 'all' || paymentFilter !== 'all' || searchQuery !== '') && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setStatusFilter('all');
                      setPaymentFilter('all');
                      setSearchQuery('');
                    }}
                    className="h-10 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    Xóa lọc
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CardTitle>Danh sách đơn hàng ({filteredOrders.length})</CardTitle>
              <HelpTooltip 
                title="Quản lý đơn hàng" 
                content="Tại đây bạn có thể quản lý quy trình xử lý đơn hàng:
                • Trạng thái đơn: Cập nhật từ Chờ xử lý → Xác nhận → Đang giao → Đã giao.
                • Xem chi tiết: Click icon con mắt để xem địa chỉ, SĐT và danh sách sản phẩm.
                • Hủy đơn: Chỉ có thể hủy khi đơn chưa được giao thành công.
                • Hoàn đơn: Xử lý các yêu cầu hoàn trả từ khách hàng."
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-semibold font-mono text-xs">#{order.id.substring(0, 8)}</span>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {order.items?.length || 0} sản phẩm
                            {order.items && order.items.length > 0 && (
                              <p className="text-sm text-gray-600 truncate">
                                {order.items[0].productName}
                                {order.items.length > 1 && ` +${order.items.length - 1}`}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {order.totalAmount.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateStatus(order.id, value)}
                            disabled={updatingStatus === order.id || order.status === 'CANCELLED' || order.status === 'RETURNED'}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue>
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Đang chờ xác nhận</SelectItem>
                              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                              <SelectItem value="PROCESSING">Đang chuẩn bị hàng</SelectItem>
                              <SelectItem value="SHIPPED">Đang giao</SelectItem>
                              <SelectItem value="DELIVERED">Đã giao</SelectItem>
                              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                              <SelectItem value="RETURN_REQUESTED">Yêu cầu trả hàng</SelectItem>
                              <SelectItem value="RETURN_CONFIRMED">Xác nhận yêu cầu</SelectItem>
                              <SelectItem value="RETURN_INSPECTING">Kiểm tra sản phẩm</SelectItem>
                              <SelectItem value="RETURNED">Đã trả hàng</SelectItem>
                              <SelectItem value="RETURN_REJECTED">Từ chối trả hàng</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
          </CardContent>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng</DialogTitle>
              <DialogDescription>
                Mã đơn: #{selectedOrder?.id.substring(0, 8)}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Status & Date */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Trạng thái</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 mb-1">Ngày đặt</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Status Stepper */}
                <div className="px-2 py-6 bg-white border border-slate-200 rounded-xl">
                  <div className="relative flex justify-between">
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s, idx, arr) => {
                      const currentIdx = arr.indexOf(selectedOrder.status);
                      const isCompleted = currentIdx >= idx;
                      const isCurrent = selectedOrder.status === s;
                      
                      const icons = {
                        PENDING: Clock,
                        CONFIRMED: Package,
                        PROCESSING: Package,
                        SHIPPED: Truck,
                        DELIVERED: CheckCircle
                      };
                      const Icon = icons[s as keyof typeof icons];
                      
                      return (
                        <div key={s} className="flex flex-col items-center relative z-10 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-bold mt-2 text-center transition-colors ${isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {getStatusText(s)}
                          </span>
                          {idx < arr.length - 1 && (
                            <div className={`absolute top-5 left-[50%] w-full h-[2px] -z-10 ${
                              currentIdx > idx ? 'bg-indigo-600' : 'bg-slate-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shipping Info */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      Thông tin giao hàng
                    </h3>
                    <div className="space-y-1 text-xs">
                      <p><span className="text-slate-600">Họ tên:</span> <span className="font-medium">{selectedOrder.shippingFullName}</span></p>
                      <p><span className="text-slate-600">Địa chỉ:</span> <span className="font-medium">{selectedOrder.shippingAddress}</span></p>
                      <p><span className="text-slate-600">Thành phố:</span> <span className="font-medium">{selectedOrder.shippingCity}</span></p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-600" />
                        <span className="font-medium">{selectedOrder.shippingPhone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      Thanh toán
                    </h3>
                    <div className="pt-1">
                      <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-600 px-3 py-1 text-xs">
                        {selectedOrder.paymentMethod || 'Chưa xác định'}
                      </Badge>
                      <p className="text-[10px] text-slate-400 mt-2 italic">
                        * Trạng thái: {selectedOrder.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Sản phẩm ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-slate-600">
                            Số lượng: {item.quantity} × {item.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <p className="font-bold text-indigo-600">
                          {item.subtotal.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-slate-200 pt-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold">Tổng cộng:</span>
                    <span className="font-bold text-2xl text-indigo-600">
                      {selectedOrder.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy đơn hàng
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
