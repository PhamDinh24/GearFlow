import { useLocation, Link } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, Home, CreditCard, ReceiptText } from "lucide-react";
import { paymentApi } from "../services/api";

export function PaymentResult() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const vnpResponseCode = query.get("vnp_ResponseCode");
  const [success, setSuccess] = useState<boolean | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("VNPAY");

  useEffect(() => {
    const returnState = location.state as {
      success?: boolean;
      paymentMethod?: string;
      orderId?: string;
    };
    if (returnState?.orderId) {
      setOrderId(returnState.orderId);
      setPaymentMethod(returnState.paymentMethod || "VNPAY");
      if (returnState.success !== undefined) {
        setSuccess(returnState.success);
      }
    }

    async function verifyVNPay() {
      if (vnpResponseCode) {
        const params: Record<string, string> = {};
        query.forEach((value, key) => {
          params[key] = value;
        });
        try {
          const payment = await paymentApi.verifyVnpayCallback(params);
          setOrderId(payment.orderId || orderId);
          setPaymentMethod(payment.paymentMethod || "VNPAY");
          setSuccess(payment.status === "SUCCESS");
        } catch (error) {
          console.error("VNPAY verification failed", error);
          setSuccess(false);
        }
      }
    }

    if (vnpResponseCode) {
      verifyVNPay();
    } else if (success === null) {
      setSuccess(false);
    }
  }, [location, vnpResponseCode, orderId, query]);

  if (success === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang xử lý thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dynamic Header Banner */}
      <section className={`${success ? 'bg-emerald-950' : 'bg-red-950'} text-white py-20 relative overflow-hidden mb-12`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${success ? 'from-emerald-600/10 to-teal-600/10' : 'from-red-600/10 to-orange-600/10'} z-0`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`w-24 h-24 rounded-[2.5rem] ${success ? 'bg-emerald-500' : 'bg-red-500'} mx-auto mb-8 flex items-center justify-center shadow-2xl`}>
              {success ? <CheckCircle2 className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
              {success ? 'THANH TOÁN THÀNH CÔNG' : 'THANH TOÁN THẤT BẠI'}
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
              {success 
                ? 'Cảm ơn bạn đã tin tưởng lựa chọn GearFlow. Đơn hàng của bạn đã được tiếp nhận và xử lý.' 
                : 'Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng kiểm tra lại thông tin.'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <Card className="border-none rounded-[3rem] shadow-2xl shadow-slate-200 bg-white overflow-hidden">
          <CardContent className="p-12">
            {success ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><ReceiptText className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Mã đơn hàng</p>
                        <p className="font-bold text-slate-900">{orderId || 'ORD-9999'}</p>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><CreditCard className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Phương thức</p>
                        <p className="font-bold text-slate-900">{paymentMethod}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 text-center">
                   <p className="text-emerald-800 font-bold mb-2">Hệ thống đang chuẩn bị hàng</p>
                   <p className="text-emerald-700/70 text-sm">Bạn sẽ sớm nhận được email xác nhận chi tiết lộ trình vận chuyển từ GearFlow.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/orders" className="flex-1">
                    <Button className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200">
                      <ShoppingBag className="w-5 h-5 mr-3" /> Xem đơn hàng
                    </Button>
                  </Link>
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-slate-100 font-black uppercase tracking-widest hover:bg-slate-50">
                      <Home className="w-5 h-5 mr-3" /> Về trang chủ
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 text-center">
                   <p className="text-red-800 font-bold mb-2">Giao dịch không thành công</p>
                   <p className="text-red-700/70 text-sm">Vui lòng kiểm tra lại số dư tài khoản hoặc thông tin thẻ của bạn và thử lại.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/checkout" className="flex-1">
                    <Button className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-xl shadow-red-200">
                      Thanh toán lại
                    </Button>
                  </Link>
                  <Link to="/cart" className="flex-1">
                    <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-slate-100 font-black uppercase tracking-widest hover:bg-slate-50">
                      Về giỏ hàng
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
           Gặp sự cố? Liên hệ hỗ trợ ngay tại <span className="text-blue-500 cursor-pointer hover:underline">support@gearflow.com</span>
        </div>
      </div>
    </div>
  );
}