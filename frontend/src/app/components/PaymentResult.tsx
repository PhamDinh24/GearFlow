import { useEffect, useState } from "react";
import { useLocation, useSearchParams, Link } from "react-router";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, Package, CreditCard, Clock } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { toast } from "sonner";

export function PaymentResult() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Check if this is a VNPay callback
  const isVNPayCallback = searchParams.has('vnp_ResponseCode');

  useEffect(() => {
    if (isVNPayCallback) {
      handleVNPayCallback();
    } else {
      // Direct navigation from COD payment
      const state = location.state;
      if (state) {
        setPaymentData({
          success: state.success,
          paymentMethod: state.paymentMethod,
          orderId: state.orderId,
        });
      }
      setLoading(false);
    }
  }, []);

  const handleVNPayCallback = async () => {
    try {
      setLoading(true);
      
      // Convert URLSearchParams to object
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Verify payment with backend
      const payment = await paymentService.verifyPayment(params);
      
      const responseCode = searchParams.get('vnp_ResponseCode');
      const success = responseCode === '00' && payment.status === 'SUCCESS';

      setPaymentData({
        success,
        paymentMethod: 'VNPAY',
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        amount: payment.amount,
      });

      if (success) {
        toast.success('Thanh toán thành công!');
      } else {
        toast.error('Thanh toán thất bại');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error('Có lỗi xảy ra khi xác thực thanh toán');
      setPaymentData({
        success: false,
        paymentMethod: 'VNPAY',
        orderId: searchParams.get('vnp_TxnRef') || 'Unknown',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  const { success, paymentMethod, orderId, transactionId, amount } = paymentData || {};

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="p-12 text-center">
            {success ? (
              <>
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-14 h-14 text-emerald-600" />
                </div>
                <h1 className="text-4xl font-bold mb-4 text-slate-900">Đặt hàng thành công!</h1>
                <p className="text-lg text-slate-600 mb-10">
                  Cảm ơn bạn đã mua hàng tại GearFlow. Đơn hàng của bạn đang được xử lý.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">Mã đơn hàng:</span>
                      </div>
                      <span className="font-bold text-slate-900">{orderId || 'N/A'}</span>
                    </div>
                    {transactionId && (
                      <div className="flex items-center justify-between py-3 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">Mã giao dịch:</span>
                        </div>
                        <span className="font-bold text-slate-900">{transactionId}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">Phương thức thanh toán:</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {paymentMethod === 'VNPAY' ? 'VNPAY' : 'Thanh toán khi nhận hàng'}
                      </span>
                    </div>
                    {amount && (
                      <div className="flex items-center justify-between py-3 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">Số tiền:</span>
                        </div>
                        <span className="font-bold text-indigo-600">{amount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">Trạng thái:</span>
                      </div>
                      <span className={`font-bold px-3 py-1 rounded-lg ${
                        paymentMethod === 'VNPAY'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {paymentMethod === 'VNPAY' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/orders">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded-xl text-base" size="lg">
                      Xem đơn hàng
                    </Button>
                  </Link>
                  <Link to="/shop">
                    <Button variant="outline" className="w-full h-14 rounded-xl text-base border-2">
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-14 h-14 text-red-600" />
                </div>
                <h1 className="text-4xl font-bold mb-4 text-slate-900">Thanh toán thất bại</h1>
                <p className="text-lg text-slate-600 mb-10">
                  Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
                </p>

                <div className="space-y-3">
                  <Link to="/checkout">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded-xl text-base" size="lg">
                      Thử lại
                    </Button>
                  </Link>
                  <Link to="/cart">
                    <Button variant="outline" className="w-full h-14 rounded-xl text-base border-2">
                      Quay về giỏ hàng
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
