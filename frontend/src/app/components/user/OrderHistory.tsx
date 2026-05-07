import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { orderApi, reviewApi } from "../../services/api";
import { OrderDTO } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CustomPagination } from "../ui/custom-pagination";
import { 
  Package, 
  Eye, 
  ChevronRight, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  Star, 
  MessageSquare,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  TrendingUp,
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
    PENDING: { label: 'CHỜ XÁC NHẬN', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    PROCESSING: { label: 'ĐANG XỬ LÝ', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
    SHIPPED: { label: 'ĐANG GIAO', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
    DELIVERED: { label: 'HOÀN THÀNH', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    CANCELLED: { label: 'ĐÃ HỦY', color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
  };

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Đang đồng bộ lịch sử đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Order Tracking</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              LỊCH SỬ ĐƠN HÀNG
            </h1>
            <p className="text-xl text-slate-400 font-bold mt-4 uppercase tracking-widest">
              Theo dõi hành trình chinh phục phím cơ của bạn
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 border-slate-50 flex items-center gap-6">
            <div className="text-right">
              <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{orders.length}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Giao dịch</div>
            </div>
            <div className="w-px h-12 bg-slate-100"></div>
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[4rem] border-4 border-dashed border-slate-100 p-32 text-center shadow-2xl shadow-slate-100">
            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 group-hover:rotate-12 transition-transform">
              <Box className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Chưa có đơn hàng</h3>
            <p className="text-xl text-slate-400 mb-12 font-bold max-w-sm mx-auto uppercase tracking-wide">
              Bắt đầu xây dựng góc làm việc mơ ước ngay bây giờ.
            </p>
            <Link to="/shop">
              <Button className="bg-slate-900 hover:bg-indigo-600 rounded-2xl px-16 py-10 font-black text-xl h-auto shadow-2xl shadow-indigo-100 transition-all">
                SHOPPING NGAY
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {paginatedOrders.map((order, index) => {
              const status = statusMap[order.status] || statusMap.PENDING;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-[3.5rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/40 overflow-hidden group hover:shadow-[0_40px_80px_rgba(99,102,241,0.1)] transition-all duration-700">
                    {/* Order Top Bar */}
                    <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 ${status.bg} ${status.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500`}>
                          <StatusIcon className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Order #{order.id.substring(0, 8)}</h3>
                            <span className={`px-4 py-1.5 rounded-xl ${status.bg} ${status.color} text-[9px] font-black uppercase tracking-widest border border-current/10`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {order.paymentMethod || 'COD'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Settlement</p>
                        <p className="text-4xl font-black text-slate-950 tracking-tighter leading-none">
                          {order.totalAmount?.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="p-10">
                      <div className="grid md:grid-cols-2 gap-8 mb-10">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50/50 border-2 border-white shadow-inner group/item hover:bg-white hover:border-indigo-50 hover:shadow-xl transition-all duration-500">
                            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-100 overflow-hidden shadow-sm flex-shrink-0 group-hover/item:scale-110 transition-transform">
                              <img src={item.imageUrl || ''} alt={item.productName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter truncate mb-1">{item.productName}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest">QTY: {item.quantity}</span>
                                <span className="text-sm font-bold text-slate-400">{item.price?.toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-slate-900 tracking-tighter">
                                {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Controls */}
                      <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t-2 border-slate-50 gap-6">
                        <div className="flex items-center gap-6">
                          {order.status === 'DELIVERED' && reviewCounts[order.id] && (
                            <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 rounded-2xl border-2 border-amber-100/50 shadow-xl shadow-amber-50">
                              <Star className="w-5 h-5 text-amber-600 fill-amber-400" />
                              <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                                {reviewCounts[order.id].reviewed}/{reviewCounts[order.id].total} Feedbacks
                              </span>
                            </div>
                          )}
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Verified</span>
                          </div>
                        </div>

                        <Link to={`/orders/${order.id}`}>
                          <Button className="h-14 px-10 bg-slate-950 hover:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all group/btn">
                            XEM CHI TIẾT ĐƠN
                            <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-2 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Pagination System */}
            {totalPages > 1 && (
              <div className="pt-12 flex justify-center">
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
