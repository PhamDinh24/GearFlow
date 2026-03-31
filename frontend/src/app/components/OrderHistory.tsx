import { useState, useEffect } from "react";
import { Link } from "react-router";
import { apiService, OrderDTO } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Package, Eye } from "lucide-react";
import { toast } from "sonner";

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await apiService.cancelOrder(orderId);
      toast.success('Đã hủy đơn hàng');
      loadOrders(); // Reload orders
    } catch (error) {
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ xử lý',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Đang tải đơn hàng...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-16">
          <CardContent>
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào trong lịch sử</p>
            <Link to="/shop">
              <Button>Bắt đầu mua sắm</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Lịch sử đơn hàng</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <Card key={order.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Đơn hàng #{order.id.substring(0, 8)}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold">Sản phẩm #{item.productId.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-blue-600">
                      {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                    <p className="font-semibold">{order.paymentMethod || 'Chưa thanh toán'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-xl font-bold text-blue-600">
                      {order.totalPrice.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link to={`/orders/${order.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                  </Link>
                  {order.status === 'DELIVERED' && (
                    <Button className="flex-1">Mua lại</Button>
                  )}
                  {order.status === 'PENDING' && (
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
