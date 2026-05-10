import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { orderApi, reviewApi } from "../../services/api";
import { OrderDTO } from "../../types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CustomPagination } from "../ui/custom-pagination";
import { 
  Package, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  Star, 
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Box
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const ITEMS_PER_PAGE = 12;

export function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewCounts, setReviewCounts] = useState<Record<string, { reviewed: number; total: number }>>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders();
      const sortedOrders = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
      
      const counts: Record<string, { reviewed: number; total: number }> = {};
      for (const order of sortedOrders) {
        if (order.status === 'DELIVERED' && order.items) {
          let reviewedCount = 0;
          for (const item of order.items) {
            try {
              const productReviews = await reviewApi.getProductReviews(item.productId);
              const userReview = productReviews.find(r => r.userId === user?.id);
              if (userReview) reviewedCount++;
            } catch (error) {}
          }
          counts[order.id] = { reviewed: reviewedCount, total: order.items.length };
        }
      }
      setReviewCounts(counts);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
    PROCESSING: { label: 'Đang xử lý', color: 'text-blue-700', bg: 'bg-blue-100', icon: Package },
    SHIPPED: { label: 'Đang giao', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: Truck },
    DELIVERED: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
    CANCELLED: { label: 'Đã hủy', color: 'text-rose-700', bg: 'bg-rose-100', icon: XCircle },
  };

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4">Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
            <p className="text-gray-500 mt-2">
              Theo dõi và quản lý các đơn hàng bạn đã đặt
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Đơn hàng</div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa thực hiện bất kỳ giao dịch nào. Hãy bắt đầu mua sắm ngay!
              </p>
              <Link to="/shop">
                <Button>
                  <ShoppingBag className="w-4 h-4 mr-2" /> Tiếp tục mua sắm
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {paginatedOrders.map((order) => {
              const status = statusMap[order.status] || statusMap.PENDING;
              return (
                <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
                  <CardHeader className="bg-white border-b border-gray-100 pb-4 pt-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 text-lg">Đơn hàng #{order.id.substring(0, 8)}</span>
                        <Badge variant="outline" className={`${status.bg} ${status.color} border-transparent font-medium`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> {order.paymentMethod || 'COD'}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                      <p className="font-bold text-xl text-indigo-600">
                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center p-6 gap-6 bg-white">
                          <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                            <img src={item.imageUrl || ''} alt={item.productName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate mb-1">{item.productName}</h4>
                            <div className="text-sm text-gray-500">
                              Số lượng: {item.quantity} × {item.price?.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                          <div className="text-right font-medium text-gray-900">
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 border-t border-gray-100 p-4 px-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {order.status === 'DELIVERED' && reviewCounts[order.id] && (
                          <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                            Đánh giá: {reviewCounts[order.id].reviewed}/{reviewCounts[order.id].total} sản phẩm
                          </div>
                        )}
                      </div>
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="bg-white font-medium hover:bg-gray-50">
                          Xem chi tiết đơn hàng
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {totalPages > 1 && (
              <div className="pt-8 pb-4 flex justify-center">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={orders.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

