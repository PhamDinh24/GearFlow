import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { orderService, type Order } from "../services/orderService";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import {
  Package, Eye, Truck, CheckCircle, Clock, XCircle,
  MapPin, Phone, ShoppingBag, CreditCard, ChevronRight, Star, Calendar
} from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";
import { toast } from "sonner";

type StatusKey = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';

const STATUS_CONFIG: Record<StatusKey, { bg: string; text: string; icon: any; label: string }> = {
  PENDING:    { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: Clock,       label: 'Chờ xử lý' },
  CONFIRMED:  { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: Package,     label: 'Đã xác nhận' },
  PROCESSING: { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: Package,     label: 'Đang xử lý' },
  SHIPPED:    { bg: 'bg-purple-50',  text: 'text-purple-600',  icon: Truck,       label: 'Đang giao' },
  DELIVERED:  { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle, label: 'Hoàn thành' },
  CANCELLED:  { bg: 'bg-red-50',     text: 'text-red-500',     icon: XCircle,     label: 'Đã hủy' },
  RETURN_REQUESTED: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Clock, label: 'Chờ hoàn đơn' },
  RETURNED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: XCircle, label: 'Đã hoàn đơn' },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status as StatusKey] || STATUS_CONFIG.PENDING;
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    orderService.getUserOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-8 bg-slate-200 rounded-lg w-52 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-24 mb-10 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-5 bg-slate-100 rounded w-40" />
                  <div className="h-6 bg-slate-100 rounded-full w-28" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-36" />
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Lịch sử đơn hàng</h1>
          <p className="text-slate-500 mb-12">0 đơn hàng</p>
          <div className="bg-white border border-slate-200 rounded-2xl text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-900">Chưa có đơn hàng nào</h2>
            <p className="text-slate-500 mb-6 text-sm">Bạn chưa có đơn hàng nào trong lịch sử</p>
            <Link to="/shop">
              <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-8 h-11">
                Bắt đầu mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Lịch sử đơn hàng</h1>
        <p className="text-slate-500 mb-10">{orders.length} đơn hàng</p>

        <OrderList 
          orders={orders} 
          onViewDetail={setSelectedOrder} 
          onCancelOrder={async (id) => {
            try {
              await orderService.cancelOrder(id);
              setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o));
              toast.success(`Đã hủy đơn hàng #${id.substring(0, 8)}`);
            } catch (error) {
              toast.error("Không thể hủy đơn hàng này");
            }
          }} 
          onReturnOrder={async (id) => {
            try {
              await orderService.requestReturn(id);
              setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'RETURN_REQUESTED' } : o));
              toast.success("Đã gửi yêu cầu hoàn đơn");
            } catch (error: any) {
              toast.error(error.response?.data?.message || "Không thể yêu cầu hoàn đơn");
            }
          }} 
        />
      </div>

      {/* Detail Dialog */}
      <OrderDetailDialog 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        onReturnOrder={async (id) => {
          try {
            await orderService.requestReturn(id);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'RETURN_REQUESTED' } : o));
            toast.success("Đã gửi yêu cầu hoàn đơn");
            setSelectedOrder(prev => prev ? { ...prev, status: 'RETURN_REQUESTED' } : null);
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể yêu cầu hoàn đơn");
          }
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Order List with pagination
───────────────────────────────────────────── */
function OrderList({
  orders,
  onViewDetail,
  onCancelOrder,
}: {
  orders: Order[];
  onViewDetail: (order: Order) => void;
  onCancelOrder: (id: string) => void;
  onReturnOrder: (id: string) => void;
}) {
  const {
    currentPage, totalPages, paginatedItems,
    goToPage, canGoNext, canGoPrevious, startIndex, endIndex, totalItems,
  } = usePagination({ items: orders, itemsPerPage: 12 });

  return (
    <>
      <div className="space-y-4">
        {paginatedItems.map(order => (
          <OrderCard key={order.id} order={order} onViewDetail={onViewDetail} onCancelOrder={onCancelOrder} onReturnOrder={onReturnOrder} />
        ))}
      </div>

      <div className="mt-8">
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
    </>
  );
}

/* ─────────────────────────────────────────────
   Single Order Card  (matches the screenshot)
───────────────────────────────────────────── */
function OrderCard({
  order,
  onViewDetail,
  onCancelOrder,
}: {
  order: Order;
  onViewDetail: (order: Order) => void;
  onCancelOrder: (id: string) => void;
  onReturnOrder: (id: string) => void;
}) {
  const sc = getStatus(order.status);
  const StatusIcon = sc.icon;
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* ── Header: ID, Status, Date, Payment ── */}
      <div className="px-6 py-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              Đơn hàng #{order.id.substring(0, 8).toUpperCase()}
            </h3>
            <Badge className={`rounded-full px-3 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
              {sc.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>{order.paymentMethod || 'COD'}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Tổng tiền</p>
          <p className="text-2xl font-black text-indigo-600">
            {order.totalAmount.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 mx-6" />

      {/* ── Items ── */}
      <div className="px-6 py-4 divide-y divide-slate-50">
        {order.items.map((item, idx) => (
          <div key={idx} className="py-4 flex items-center gap-4 group">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
              <img 
                src={item.imageUrl || '/placeholder-product.png'} 
                alt={item.productName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=GearFlow')}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-sm mb-1 truncate">{item.productName}</h4>
              <p className="text-xs text-slate-500">
                Số lượng: {item.quantity} × {item.price.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold text-slate-900">
                {(item.subtotal ?? item.price * item.quantity).toLocaleString('vi-VN')}đ
              </p>
              {order.status === 'DELIVERED' && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-indigo-600 font-bold text-xs"
                  onClick={() => navigate(`/product/${item.productId}?tab=reviews`)}
                >
                  Đánh giá
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 mx-6" />

      {/* ── Footer ── */}
      <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          {order.status === 'DELIVERED' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold">Đánh giá: 0/{order.items.length} sản phẩm</span>
            </div>
          )}
          {order.status === 'PENDING' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelOrder(order.id)}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl h-9"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hủy đơn
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {order.status === 'DELIVERED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn yêu cầu hoàn đơn cho đơn hàng này?")) {
                  onReturnOrder(order.id);
                }
              }}
              className="text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl h-9"
            >
              Hoàn đơn
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetail(order)}
            className="rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-white hover:border-slate-300 shadow-sm transition-all h-9"
          >
            Xem chi tiết đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Order Detail Dialog
───────────────────────────────────────────── */
function OrderDetailDialog({
  order,
  onClose,
  onReturnOrder,
}: {
  order: Order | null;
  onClose: () => void;
  onReturnOrder: (id: string) => void;
}) {
  if (!order) return null;
  const sc = getStatus(order.status);
  const StatusIcon = sc.icon;
  const navigate = useNavigate();

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Chi tiết đơn hàng
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            #{order.id.substring(0, 8).toUpperCase()} ·{' '}
            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Status Stepper */}
          <div className="px-2 py-4">
            <div className="relative flex justify-between">
              {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s, idx, arr) => {
                const currentIdx = arr.indexOf(order.status);
                const isCompleted = currentIdx >= idx;
                const isCurrent = order.status === s;
                const stepSc = getStatus(s);
                
                return (
                  <div key={s} className="flex flex-col items-center relative z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}>
                      <stepSc.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold mt-2 text-center transition-colors ${isCompleted ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {stepSc.label}
                    </span>
                    {idx < arr.length - 1 && (
                      <div className={`absolute top-5 left-[50%] w-full h-[2px] -z-10 ${
                        currentIdx > idx ? 'bg-indigo-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            {(order.status === 'CANCELLED' || order.status === 'RETURN_REQUESTED' || order.status === 'RETURNED') && (
              <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sc.bg} ${sc.text}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${sc.text}`}>{sc.label}</p>
                  <p className="text-xs text-slate-500">Trạng thái hiện tại của đơn hàng</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping info */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Thông tin giao hàng
              </p>
              <div className="pl-6 space-y-1">
                <p className="text-sm text-slate-900 font-medium">{order.shippingFullName}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingCity}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                  <Phone className="w-3 h-3" /> {order.shippingPhone}
                </p>
              </div>
            </div>

            {/* Payment info */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Thanh toán
              </p>
              <div className="pl-6 pt-1">
                <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-600 px-3 py-1">
                  {order.paymentMethod || 'Chưa xác định'}
                </Badge>
                <p className="text-xs text-slate-400 mt-2 italic">
                  * Trạng thái thanh toán: {order.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900">
                Sản phẩm ({order.items.length})
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between px-4 py-3 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.quantity} × {item.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                      {(item.subtotal ?? item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                    {order.status === 'DELIVERED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-indigo-600 text-xs font-semibold hover:bg-indigo-50"
                        onClick={() => {
                          onClose();
                          navigate(`/product/${item.productId}?tab=reviews`);
                        }}
                      >
                        Đánh giá
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="font-semibold text-slate-900">Tổng cộng</span>
            <span className="text-xl font-bold text-slate-900">
              {order.totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Action button in dialog */}
          {order.status === 'DELIVERED' && (
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-bold mt-4"
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn yêu cầu hoàn đơn cho đơn hàng này?")) {
                  onReturnOrder(order.id);
                }
              }}
            >
              Yêu cầu hoàn đơn
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
