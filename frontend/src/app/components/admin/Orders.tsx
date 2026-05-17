import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { AdminPageWrapper } from "./PageWrapper";
import { HelpTooltip } from "../common/HelpTooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, Eye } from "lucide-react";
import { adminApi, orderApi, userApi } from "../../services/api";
import { OrderDTO } from "../../app/types";
import { toast } from "sonner";
import { usePagination } from "../../hooks/usePagination";
import { DataPagination } from "../ui/data-pagination";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../ui/dialog";
import { ConfirmDialog } from "../common/ConfirmDialog";

export function Orders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewOrder, setViewOrder] = useState<OrderDTO | null>(null);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{ open: boolean; orderId: string; status: string }>({ open: false, orderId: "", status: "" });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await adminApi.getAllOrders();
      // sort by newest
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items && order.items.some(item => 
        (item as any).productName && (item as any).productName.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedOrders,
    goToPage,
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
    const s = status.toLowerCase();
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      return_requested: 'bg-orange-100 text-orange-800',
      returned: 'bg-gray-200 text-gray-800',
      return_rejected: 'bg-red-100 text-red-800',
    };
    return colors[s] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const s = status.toUpperCase();
    const texts: Record<string, string> = {
      PENDING: 'Đang chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang chuẩn bị hàng',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Đã giao thành công',
      CANCELLED: 'Đã hủy',
      RETURN_REQUESTED: 'Yêu cầu trả hàng',
      RETURNED: 'Trả hàng thành công',
      RETURN_REJECTED: 'Từ chối trả hàng',
    };
    return texts[s] || status;
  };

  const totalRevenue = filteredOrders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrdersCount = filteredOrders.length;
  const pendingOrdersCount = orders.filter(o => o.status.toLowerCase() === 'pending' || o.status === 'RETURN_REQUESTED').length;

  const getValidTransitions = (currentStatus: string): string[] => {
    const s = currentStatus.toUpperCase();
    switch (s) {
      case 'PENDING':
        return ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PROCESSING', 'SHIPPED', 'CANCELLED'];
      case 'PROCESSING':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED', 'CANCELLED'];
      case 'DELIVERED':
        return ['RETURN_REQUESTED'];
      case 'RETURN_REQUESTED':
        return ['RETURNED', 'RETURN_REJECTED'];
      default:
        return [];
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      setStatusChangeConfirm({ open: true, orderId, status: newStatus });
      return;
    }
    await performStatusChange(orderId, newStatus);
  };

  const performStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ ...viewOrder, status: newStatus });
      }
      toast.success(`Đã cập nhật đơn hàng sang "${getStatusText(newStatus)}"`);
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật trạng thái đơn hàng");
    } finally {
      setStatusChangeConfirm({ open: false, orderId: "", status: "" });
    }
  };

  return (
    <>
      <AdminPageWrapper 
      title="Quản lý đơn hàng" 
      description="Theo dõi và xử lý đơn hàng từ khách hàng"
      helpContent="Quy trình xử lý đơn hàng chuyên nghiệp:
        • Trạng thái: Cập nhật đơn từ Chờ xử lý -> Đã xác nhận -> Đang giao -> Đã giao.
        • Xem chi tiết: Click icon con mắt để xem địa chỉ giao hàng và danh sách sản phẩm.
        • Doanh thu: Chỉ những đơn hàng đã Giao thành công mới được tính vào doanh thu.
        • Tìm kiếm: Tìm nhanh đơn hàng theo Mã đơn hoặc tên Sản phẩm trong đơn."
    >
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-3xl font-bold">{totalOrdersCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu (Đã giao)</p>
                <p className="text-3xl font-bold text-green-600">
                  {(totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đơn chờ xử lý / Trả hàng</p>
                <p className="text-3xl font-bold text-orange-600">
                  {pendingOrdersCount}
                </p>
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
                  placeholder="Tìm kiếm mã đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipped">Đang giao</SelectItem>
                  <SelectItem value="delivered">Đã giao</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="return_requested">Yêu cầu trả hàng</SelectItem>
                  <SelectItem value="returned">Đã hoàn trả</SelectItem>
                  <SelectItem value="return_rejected">Từ chối trả hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn hàng ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const firstItem = order.items && order.items[0];
                    const itemCount = order.items ? order.items.length : 0;
                    const firstItemName = (firstItem as any)?.productName || 'Sản phẩm';
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-semibold">#{order.id.substring(0, 8)}</span>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {itemCount} sản phẩm
                            <p className="text-sm text-gray-600 truncate">
                              {firstItemName}
                              {itemCount > 1 && ` +${itemCount - 1}`}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {order.paymentMethod || 'COD'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {order.totalAmount.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setViewOrder(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="border-t border-slate-100">
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
          </CardContent>
        </Card>
    </AdminPageWrapper>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{viewOrder?.id.substring(0,8)}</DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-600">Ngày đặt hàng</p>
                  <p>{new Date(viewOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Trạng thái</p>
                  <Badge className={getStatusColor(viewOrder.status)}>{getStatusText(viewOrder.status)}</Badge>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="font-semibold text-gray-600">Địa chỉ giao hàng</p>
                  <p>{viewOrder.shippingAddress}</p>
                  <p>{viewOrder.shippingCity}</p>
                  <p>{viewOrder.shippingPhone}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Sản phẩm</h4>
                <div className="space-y-3">
                  {viewOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.productName || `Product ID: ${item.productId}`}</p>
                        <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-bold">Tổng thanh toán:</span>
                <span className="font-bold text-lg text-indigo-600">{viewOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="border-t pt-4">
                <p className="font-semibold mb-3 text-slate-700">Cập nhật trạng thái mới</p>
                {getValidTransitions(viewOrder.status).length > 0 ? (
                  <div className="flex gap-3 items-center">
                    <Select onValueChange={(val) => handleStatusChange(viewOrder.id, val)}>
                      <SelectTrigger className="w-[240px] rounded-xl h-11 border-slate-200 shadow-sm">
                        <SelectValue placeholder="Chọn trạng thái mới..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {getValidTransitions(viewOrder.status).map((status) => (
                          <SelectItem key={status} value={status} className="rounded-lg py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                              <span>{getStatusText(status)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400 italic">
                      * Chỉ hiển thị các trạng thái hợp lệ tiếp theo
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">Đơn hàng đã hoàn tất, không thể thay đổi trạng thái.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={statusChangeConfirm.open}
        onOpenChange={(open) => setStatusChangeConfirm({ ...statusChangeConfirm, open })}
        onConfirm={() => performStatusChange(statusChangeConfirm.orderId, statusChangeConfirm.status)}
        title="Xác nhận hủy đơn hàng"
        description="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này sẽ hoàn lại tồn kho và không thể hoàn tác."
        type="danger"
        confirmText="Hủy đơn hàng"
      />
    </>
  );
}
