import { useState, useEffect } from "react";
import { Link } from "react-router";
import { orderService, type Order } from "../services/orderService";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import {
  Package, Eye, Truck, CheckCircle, Clock, XCircle,
  MapPin, Phone, ShoppingBag,
} from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";

type StatusKey = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_CONFIG: Record<StatusKey, { bg: string; text: string; icon: any; label: string }> = {
  PENDING:    { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: Clock,       label: 'Chờ xử lý' },
  CONFIRMED:  { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: Package,     label: 'Đã xác nhận' },
  PROCESSING: { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: Package,     label: 'Đang xử lý' },
  SHIPPED:    { bg: 'bg-purple-50',  text: 'text-purple-600',  icon: Truck,       label: 'Đang giao hàng' },
  DELIVERED:  { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle, label: 'Đã giao hàng' },
  CANCELLED:  { bg: 'bg-red-50',     text: 'text-red-500',     icon: XCircle,     label: 'Đã hủy' },
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

        <OrderList orders={orders} onViewDetail={setSelectedOrder} />
      </div>

      {/* Detail Dialog */}
      <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Order List with pagination
───────────────────────────────────────────── */
function OrderList({
  orders,
  onViewDetail,
}: {
  orders: Order[];
  onViewDetail: (order: Order) => void;
}) {
  const {
    currentPage, totalPages, paginatedItems,
    goToPage, canGoNext, canGoPrevious, startIndex, endIndex, totalItems,
  } = usePagination({ items: orders, itemsPerPage: 12 });

  return (
    <>
      <div className="space-y-4">
        {paginatedItems.map(order => (
          <OrderCard key={order.id} order={order} onViewDetail={onViewDetail} />
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
}: {
  order: Order;
  onViewDetail: (order: Order) => void;
}) {
  const sc = getStatus(order.status);
  const StatusIcon = sc.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* ── Header: order id + date + status ── */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4">
        <div>
          <h3 className="font-bold text-slate-900">
            Đơn hàng #{order.id.substring(0, 8).toUpperCase()}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Ngày đặt:{' '}
            {new Date(order.createdAt).toLocaleString('vi-VN', {
              hour: '2-digit', minute: '2-digit',
              day: '2-digit', month: '2-digit', year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0 ${sc.bg} ${sc.text}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {sc.label}
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100 mx-6" />

      {/* ── Items ── */}
      <div className="px-6 py-4 space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm leading-snug">
                {item.productName}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                SL: {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-slate-900 text-sm flex-shrink-0">
              {(item.subtotal ?? item.price * item.quantity).toLocaleString('vi-VN')}đ
            </p>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100 mx-6" />

      {/* ── Footer: total + action ── */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Tổng tiền</p>
          <p className="text-xl font-bold text-slate-900">
            {order.totalAmount.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(order)}
          className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 h-9 px-4"
        >
          <Eye className="w-4 h-4" />
          Xem chi tiết
        </Button>
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
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;
  const sc = getStatus(order.status);
  const StatusIcon = sc.icon;

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

        <div className="space-y-5 pt-2">
          {/* Status */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <span className="text-sm text-slate-600 font-medium">Trạng thái</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${sc.bg} ${sc.text}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {sc.label}
            </span>
          </div>

          {/* Shipping info */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Thông tin giao hàng
            </p>
            <p className="text-sm text-slate-600 pl-6">{order.shippingAddress}</p>
            {order.shippingCity && (
              <p className="text-sm text-slate-600 pl-6">{order.shippingCity}</p>
            )}
            {order.shippingPhone && (
              <p className="text-sm text-slate-600 pl-6 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.shippingPhone}
              </p>
            )}
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
                  <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                    {(item.subtotal ?? item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
