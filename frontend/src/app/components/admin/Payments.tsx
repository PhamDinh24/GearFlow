import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AdminPageWrapper } from "./PageWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CreditCard, Search, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { adminApi } from "../../services/api";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { usePagination } from "../../hooks/usePagination";
import { DataPagination } from "../ui/data-pagination";

export function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllPayments();
      setPayments(data);
    } catch (error) {
      toast.error("Không thể tải lịch sử thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "SUCCESS":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Thành công</Badge>;
      case "FAILED":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Thất bại</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Chờ xử lý</Badge>;
      case "CANCELLED":
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter(p => 
    p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.transactionId && p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedPayments,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    items: filteredPayments,
    itemsPerPage: 12,
  });

  return (
    <AdminPageWrapper 
      title="Quản lý thanh toán" 
      description="Theo dõi lịch sử giao dịch và trạng thái thanh toán"
      helpContent="Hệ thống đối soát tài chính:
        • Phương thức: Hỗ trợ theo dõi cả thanh toán VNPAY (Online) và COD (Tiền mặt).
        • Trạng thái: Kiểm soát các giao dịch Thành công, Thất bại hoặc Chờ xử lý.
        • Mã giao dịch: Sử dụng mã này để đối soát với hệ thống ngân hàng hoặc ví điện tử.
        • Tìm kiếm: Hỗ trợ tìm nhanh theo Mã đơn hàng để giải quyết các vấn đề khiếu nại thanh toán."
    >
        {/* Search & Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Tìm theo mã đơn hàng hoặc mã giao dịch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>

        <Card className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Lịch sử giao dịch ({filteredPayments.length})
              </CardTitle>
              <button 
                onClick={loadPayments}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Làm mới
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Đang tải dữ liệu...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-slate-500">Không tìm thấy giao dịch nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-bold py-4">Mã đơn hàng</TableHead>
                      <TableHead className="font-bold">Phương thức</TableHead>
                      <TableHead className="font-bold">Mã giao dịch</TableHead>
                      <TableHead className="font-bold">Số tiền</TableHead>
                      <TableHead className="font-bold">Ngày tạo</TableHead>
                      <TableHead className="font-bold text-center">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium">
                          #{payment.orderId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-semibold px-2 py-0.5">
                              {payment.paymentMethod}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm font-mono">
                          {payment.transactionId || "N/A"}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">
                          {payment.amount.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(payment.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getStatusBadge(payment.status)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <div className="border-t border-slate-100">
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
        </Card>
    </AdminPageWrapper>
  );
}
