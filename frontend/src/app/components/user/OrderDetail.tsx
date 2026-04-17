import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { orderApi } from "../../services/api";
import { OrderDTO } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowLeft, Package, MapPin, Phone, CreditCard, ChevronRight, CheckCircle2, Truck, Clock } from "lucide-react";
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

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    PENDING: { label: 'Chờ xử lý', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    PROCESSING: { label: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
    SHIPPED: { label: 'Đang giao', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
    DELIVERED: { label: 'Đã hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowLeft },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) return null;
  const status = statusMap[order.status] || statusMap.PENDING;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Detail Header Banner */}
      <section className="bg-slate-950 text-white py-12 relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <div>
            <Link to="/orders" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại lịch sử</span>
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tighter">ĐƠN HÀNG #{order.id.substring(0, 8)}</h1>
          </div>
          <div className={`hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl ${status.bg} ${status.color} border border-current opacity-70`}>
             <status.icon className="w-5 h-5" />
             <span className="font-black uppercase tracking-widest text-xs">{status.label}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none rounded-[2.5rem] shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-xl font-black tracking-tighter uppercase text-slate-900">Chi tiết sản phẩm</CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="space-y-6">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                          <img src={item.imageUrl || ''} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-lg">{item.productName || `Sản phẩm #${item.productId.substring(0, 4)}`}</h4>
                          <p className="text-xs text-slate-500 font-medium">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-none rounded-3xl shadow-sm bg-white p-8">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-blue-600" /> Địa chỉ giao hàng
                  </h4>
                  <p className="font-bold text-slate-900 mb-1">{order.shippingAddress}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{order.shippingCity}</p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3 text-slate-900">
                     <Phone className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-sm">{order.shippingPhone || 'Chưa cập nhật'}</span>
                  </div>
               </Card>

               <Card className="border-none rounded-3xl shadow-sm bg-white p-8">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                     <CreditCard className="w-4 h-4 text-blue-600" /> Phương thức thanh toán
                  </h4>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                        <CreditCard className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900">{order.paymentMethod || 'COD'}</p>
                        <p className="text-[10px] uppercase font-black text-emerald-600">Đã xác nhận</p>
                     </div>
                  </div>
               </Card>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <aside className="space-y-8">
             <Card className="border-none rounded-[2.5rem] shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="bg-slate-950 p-6 text-white text-center">
                   <CardTitle className="text-sm font-black tracking-widest uppercase">Tổng kết đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-medium">Tạm tính</span>
                         <span className="font-bold text-slate-900">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-medium">Phí vận chuyển</span>
                         <span className="font-bold text-slate-900">50,000đ</span>
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng</p>
                            <p className="text-3xl font-black text-blue-600 tracking-tighter">{((order.totalAmount || 0) + 50000).toLocaleString('vi-VN')}đ</p>
                         </div>
                      </div>
                   </div>

                   {order.status === 'PENDING' && (
                     <Button 
                       variant="destructive" 
                       className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-200"
                       onClick={handleCancelOrder}
                     >
                        Hủy đơn hàng
                     </Button>
                   )}

                   <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                         <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Thời gian đặt</p>
                         <p className="text-xs font-bold text-slate-900">{new Date(order.createdAt).toLocaleTimeString('vi-VN')} {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
