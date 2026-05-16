import { useState, useEffect } from "react";
import { reviewService, type Review } from "../services/reviewService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { AdminNav } from "./AdminNav";
import { HelpTooltip } from "./common/HelpTooltip";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "./ui/dialog";
import { Search, Star, CheckCircle, XCircle, MessageSquare, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyItem, setReplyItem] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [viewItem, setViewItem] = useState<Review | null>(null);

  const filtered = reviews.filter(r => {
    const matchSearch = r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchRating = ratingFilter === "all" || r.rating === Number(ratingFilter);
    return matchSearch && matchStatus && matchRating;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedReviews,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    items: filtered,
    itemsPerPage: 12,
  });

  const statusConfig = {
    approved: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700" },
    pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" },
    rejected: { label: "Đã từ chối", color: "bg-red-100 text-red-700" },
  };

  const handleApprove = async (id: string) => {
    try {
      await reviewService.updateReviewStatus(id, 'approved');
      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      toast.success("Đã duyệt đánh giá");
    } catch (error) {
      toast.error("Không thể duyệt đánh giá");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reviewService.updateReviewStatus(id, 'rejected');
      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      toast.success("Đã từ chối đánh giá");
    } catch (error) {
      toast.error("Không thể từ chối đánh giá");
    }
  };

  const handleDelete = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success("Đã xóa đánh giá");
  };

  const handleReply = () => {
    if (replyItem && replyText.trim()) {
      setReviews(prev => prev.map(r =>
        r.id === replyItem.id ? { ...r, adminReply: replyText } : r
      ));
      setReplyItem(null);
      setReplyText("");
      toast.success("Đã gửi phản hồi");
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const avgRating = reviews.filter(r => r.status === 'approved').reduce((s, r) => s + r.rating, 0) /
    (reviews.filter(r => r.status === 'approved').length || 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-slate-900">Bảo trì đánh giá</h1>
            <HelpTooltip 
              title="Quản lý đánh giá" 
              content="Theo dõi và tương tác với phản hồi từ khách hàng:
              • Kiểm duyệt: Các đánh giá mới sẽ ở trạng thái Chờ duyệt. Bạn cần Duyệt để chúng xuất hiện trên trang sản phẩm.
              • Phản hồi: Gửi lời cảm ơn hoặc giải đáp thắc mắc cho những đánh giá đã được duyệt.
              • Lọc: Dễ dàng tìm các đánh giá tiêu cực (1-2 sao) để xử lý kịp thời.
              • Từ chối/Xóa: Loại bỏ các đánh giá vi phạm quy tắc cộng đồng hoặc spam."
            />
          </div>
          <p className="text-slate-500 mt-1">Kiểm duyệt và quản lý đánh giá từ khách hàng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tổng đánh giá", value: reviews.length, color: "text-slate-900" },
            { label: "Chờ duyệt", value: pendingCount, color: "text-amber-600" },
            { label: "Đã duyệt", value: approvedCount, color: "text-emerald-600" },
            { label: "Điểm TB", value: avgRating.toFixed(1) + "★", color: "text-indigo-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm tên người dùng, nội dung..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sao</SelectItem>
                {[5, 4, 3, 2, 1].map(r => (
                  <SelectItem key={r} value={String(r)}>{r} sao</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Không có đánh giá nào phù hợp</p>
            </div>
          ) : (
            paginatedReviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.userName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-900">{review.userName}</span>
                        <Badge className={statusConfig[review.status].color}>
                          {statusConfig[review.status].label}
                        </Badge>
                        <span className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">Sản phẩm #{review.productId}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{review.comment}</p>
                      {review.adminReply && (
                        <div className="mt-2 p-3 bg-indigo-50 rounded-xl">
                          <p className="text-xs font-semibold text-indigo-600 mb-1">💬 Phản hồi của bạn</p>
                          <p className="text-xs text-slate-700">{review.adminReply}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 rounded-lg h-8 text-xs gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(review.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-8 text-xs gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setReplyItem(review); setReplyText(review.adminReply || ""); }}
                        className="rounded-lg h-8 text-xs gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Phản hồi
                      </Button>
                    )}
                    {review.status === 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(review.id)}
                        className="rounded-lg h-8 text-xs gap-1.5 text-emerald-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Duyệt lại
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(review.id)}
                      className="rounded-lg h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
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
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!replyItem} onOpenChange={() => setReplyItem(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>Gửi phản hồi cho đánh giá của khách hàng</DialogDescription>
          </DialogHeader>
          {replyItem && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-slate-800">{replyItem.userName}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= replyItem.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{replyItem.comment}</p>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">Nội dung phản hồi</Label>
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Nhập phản hồi của GearFlow..."
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyItem(null)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleReply} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Gửi phản hồi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
