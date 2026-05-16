import React, { useState, useEffect, useMemo } from 'react';
import { reviewApi, ReviewDTO } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Pagination } from '../ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Star, Edit, Trash2, User, MessageSquare, Filter, SortAsc, SortDesc, Search, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface ProductReviewsProps {
  productId: string;
  productName?: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1';

const ITEMS_PER_PAGE = 12;

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDTO | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<FilterOption>('all');

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, avgRating] = await Promise.all([
        reviewApi.getProductReviews(productId),
        reviewApi.getAverageRating(productId),
      ]);
      setReviews(reviewsData);
      setAverageRating(avgRating);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  // Filter and Sort logic
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.comment.toLowerCase().includes(query) ||
        r.userName?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, filterRating, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filteredAndSortedReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, filterRating]);

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    try {
      if (editingReview) {
        await reviewApi.updateReview(editingReview.id, { rating, comment });
        toast.success('Cập nhật đánh giá thành công');
      } else {
        await reviewApi.createReview({ productId, rating, comment });
        toast.success('Đánh giá thành công! Cảm ơn bạn đã chia sẻ.');
      }
      setShowReviewDialog(false);
      setEditingReview(null);
      setRating(5);
      setComment('');
      await loadReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Không thể gửi đánh giá';

      // Check for specific error cases
      if (errorMessage.includes('already reviewed') || errorMessage.includes('đã đánh giá')) {
        toast.error('Bạn đã đánh giá sản phẩm này rồi. Vui lòng chỉnh sửa đánh giá cũ.');
      } else if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await reviewApi.deleteReview(reviewToDelete);
      toast.success('Xóa đánh giá thành công');
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
      loadReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Không thể xóa đánh giá');
    }
  };

  const confirmDelete = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };

  const handleEditReview = (review: ReviewDTO) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewDialog(true);
  };

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-8 h-8',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer transition-all duration-200' : ''
              } ${star <= (interactive ? (hoveredStar || rating) : rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
              }`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
          />
        ))}
      </div>
    );
  };

  const userHasReviewed = reviews.some((r) => r.userId === user?.id);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Đang tải đánh giá...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="border-b bg-slate-50/50 p-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Minimalist Score */}
            <div className="flex flex-col items-center justify-center min-w-[160px]">
              <div className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-3">
                {renderStars(Math.round(averageRating), false, 'lg')}
              </div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                {reviews.length} đánh giá
              </p>
            </div>

            {/* Distribution Bars */}
            <div className="flex-1 w-full max-w-md">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-4 mb-2 last:mb-0">
                    <div className="flex items-center gap-1.5 w-10 shrink-0">
                      <span className="text-xs font-bold text-slate-500">{star}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Integrated Filters */}
          <div className="border-b border-slate-100 p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm đánh giá..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-sm"
                />
              </div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value as FilterOption)}
                className="w-full px-4 py-2 h-10 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white transition-all appearance-none cursor-pointer text-sm font-medium text-slate-600"
              >
                <option value="all">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 h-10 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white transition-all appearance-none cursor-pointer text-sm font-medium text-slate-600"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="highest">Cao nhất</option>
                <option value="lowest">Thấp nhất</option>
              </select>
            </div>
          </div>

          {/* Review List */}
          <div className="p-8">
            {paginatedReviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium mb-6">
                  {searchQuery || filterRating !== 'all'
                    ? 'Không tìm thấy đánh giá phù hợp'
                    : 'Chưa có đánh giá nào cho sản phẩm này'}
                </p>
                {isLoggedIn && !userHasReviewed && (
                  <Button
                    onClick={() => {
                      setEditingReview(null);
                      setRating(5);
                      setComment('');
                      setShowReviewDialog(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Viết Đánh Giá
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {paginatedReviews.map((review) => (
                  <div key={review.id} className="py-8 first:pt-0 last:pb-0 group">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          {review.userName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{review.userName || 'Người dùng'}</h4>
                            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 rounded-lg">
                              <span className="text-[10px] font-black text-amber-600">{review.rating}</span>
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            </div>
                            {user?.id === review.userId && (
                              <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none px-2 py-0 h-4 text-[10px] font-bold">
                                BẠN
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {user?.id === review.userId && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditReview(review)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => confirmDelete(review.id)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="sm:pl-14">
                      <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Integrated */}
            {totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-slate-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAndSortedReviews.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Review Dialog - Enhanced */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="review-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingReview ? '✏️ Chỉnh Sửa Đánh Giá' : '⭐ Viết Đánh Giá'}
            </DialogTitle>
            <DialogDescription id="review-dialog-description" className="text-base">
              Chia sẻ trải nghiệm của bạn về <span className="font-semibold text-gray-900">{productName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Rating Section */}
            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <Label className="text-base font-bold mb-3 block text-slate-900">Đánh giá của bạn</Label>
              <div className="flex items-center gap-6">
                {renderStars(rating, true, 'lg')}
                <div className="flex-1">
                  <p className="text-xl font-bold text-indigo-600">
                    {rating === 5 && 'Tuyệt vời!'}
                    {rating === 4 && 'Rất tốt'}
                    {rating === 3 && 'Tốt'}
                    {rating === 2 && 'Tạm được'}
                    {rating === 1 && 'Không hài lòng'}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {rating}/5 sao
                  </p>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <Label htmlFor="comment" className="text-lg font-bold mb-2 block">
                Nhận xét chi tiết
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ chi tiết về trải nghiệm của bạn với sản phẩm này. Điều gì bạn thích? Có điều gì cần cải thiện không?"
                className="mt-2 min-h-[150px] text-base"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <p className={`text-sm ${comment.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {comment.length < 10 && '⚠️ '}
                  {comment.length}/500 ký tự
                  {comment.length < 10 && ' (Tối thiểu 10 ký tự)'}
                </p>
                {comment.length >= 10 && (
                  <span className="text-sm text-green-600 font-medium">✓ Đủ độ dài</span>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">💡 Mẹo viết đánh giá hay:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Mô tả chi tiết về chất lượng sản phẩm</li>
                <li>Chia sẻ trải nghiệm sử dụng thực tế</li>
                <li>Đề cập điểm mạnh và điểm cần cải thiện</li>
                <li>Giúp người khác đưa ra quyết định mua hàng</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setEditingReview(null);
                setRating(5);
                setComment('');
              }}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={comment.trim().length < 10}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-11 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              {editingReview ? '💾 Cập Nhật Đánh Giá' : '📝 Gửi Đánh Giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5" />
              Xác nhận xóa đánh giá
            </DialogTitle>
            <DialogDescription className="py-4 text-base">
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={handleDeleteReview}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
