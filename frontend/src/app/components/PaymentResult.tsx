import { useLocation, Link } from "react-router";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export function PaymentResult() {
  const location = useLocation();
  const { success, paymentMethod, orderId } = location.state || { success: true };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardContent className="p-12 text-center">
          {success ? (
            <>
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Đặt hàng thành công!</h1>
              <p className="text-gray-600 mb-8">
                Cảm ơn bạn đã mua hàng tại GearFlow. Đơn hàng của bạn đang được xử lý.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold">{orderId || 'ORD001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức thanh toán:</span>
                    <span className="font-semibold">
                      {paymentMethod === 'VNPAY' ? 'VNPAY' : 'COD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="text-green-600 font-semibold">
                      {paymentMethod === 'VNPAY' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/orders">
                  <Button className="w-full" size="lg">
                    Xem đơn hàng
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Thanh toán thất bại</h1>
              <p className="text-gray-600 mb-8">
                Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
              </p>

              <div className="space-y-3">
                <Link to="/checkout">
                  <Button className="w-full" size="lg">
                    Thử lại
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="outline" className="w-full">
                    Quay về giỏ hàng
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}