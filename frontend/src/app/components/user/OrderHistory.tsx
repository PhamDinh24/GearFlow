import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { orderApi } from "../../services/api";
import { OrderDTO } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Package, Eye, ChevronRight, ShoppingBag, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const statusMap: Record<string, { label: string, color: string, bg: string }> = {
    PENDING: { label: 'Chờ xử lý', color: 'text-amber-600', bg: 'bg-amber-50' },
    PROCESSING: { label: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-50' },
    SHIPPED: { label: 'Đang giao', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    DELIVERED: { label: 'Hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <section className="bg-slate-950 text-white py-16 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">LỊCH SỬ ĐƠN HÀNG</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Quản lý và theo dõi hành trình trải nghiệm các bộ phím cơ của bạn.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <Card className="text-center py-24 border-none rounded-[3rem] shadow-xl shadow-slate-200">
            <CardContent>
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-slate-200" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Chưa có đơn hàng nào</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Hãy bắt đầu hành trình xây dựng góc làm việc mơ ước với GearFlow ngay hôm nay.</p>
              <Link to="/shop">
                <Button size="lg" className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl px-10 h-14 font-bold transition-all shadow-lg shadow-slate-200">
                  Khám phá sản phẩm
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const status = statusMap[order.status] || statusMap.PENDING;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="border-none rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <ShoppingBag className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900">
                              Đơn hàng #{order.id.substring(0, 8)}
                            </CardTitle>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400 font-medium">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                              <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {order.paymentMethod || 'COD'}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full ${status.bg} ${status.color} text-xs font-black uppercase tracking-widest border border-current opacity-70`}>
                          {status.label}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <div className="flex flex-col md:flex-row items-end md:items-center justify-between pt-6 border-t border-slate-50 gap-6">
                        <div className="flex -space-x-4">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-xl border-4 border-white overflow-hidden shadow-sm bg-slate-100">
                              <img src={item.imageUrl || ''} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-xl border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5">Tổng thanh toán</p>
                              <p className="text-2xl font-black text-blue-600 tracking-tighter">
                                {order.totalAmount?.toLocaleString('vi-VN')}đ
                              </p>
                           </div>
                           <Link to={`/orders/${order.id}`}>
                              <Button variant="ghost" className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all">
                                <ChevronRight className="w-5 h-5" />
                              </Button>
                           </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
