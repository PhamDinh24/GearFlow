import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { orderApi } from "../../services/api";
import { OrderDTO } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowLeft, Package, MapPin, Phone, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await orderApi.getOrder(orderId!);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      await orderApi.cancelOrder(order.id);
      toast.success('Đã hủy đơn hàng');
      loadOrder();
    } catch (error) {
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ xử lý',
      CONFIRMED: 'Đã xác nhận',
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
        <div className="text-lg">Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-16">
          <CardContent>
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa</p>
            <Button onClick={() => navigate('/orders')}>Quay lại danh sách</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Đơn hàng #{order.id.substring(0, 8)}</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
                {getStatusText(order.status)}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Thông tin giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Địa chỉ</p>
              <p className="font-semibold">{order.shippingAddress || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Thành phố</p>
              <p className="font-semibold">{order.shippingCity || 'Chưa cập nhật'}</p>
            </div>
            {order.shippingPostalCode && (
              <div>
                <p className="text-sm text-gray-600">Mã bưu điện</p>
                <p className="font-semibold">{order.shippingPostalCode}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <p className="font-semibold">{order.shippingPhone || 'Chưa cập nhật'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sản phẩm trong đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold">Sản phẩm #{item.productId.substring(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity} × {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <p className="font-bold text-blue-600">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-semibold">{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-semibold">50,000đ</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">
                  {((order.totalAmount || 0) + 50000).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
          <Card>
            <CardContent className="pt-6">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelOrder}
              >
                Hủy đơn hàng
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
