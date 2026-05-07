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

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Xóa đánh giá thành công');
      loadReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Không thể xóa đánh giá');
    }
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
            className={`${sizeClasses[size]} ${
              interactive ? 'cursor-pointer transition-all duration-200' : ''
            } ${
              star <= (interactive ? (hoveredStar || rating) : rating)
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
      {/* Rating Summary */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Đánh Giá Sản Phẩm</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{productName}</p>
            </div>
            {isLoggedIn && !userHasReviewed && (
              <Button
                onClick={() => {
                  setEditingReview(null);
                  setRating(5);
                  setComment('');
                  setShowReviewDialog(true);
                }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Viết Đánh Giá
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-black text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(averageRating), false, 'lg')}
              <p className="text-sm text-gray-500 mt-2">
                {reviews.length} đánh giá
              </p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{star}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List with Filters */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-lg">Tất Cả Đánh Giá ({filteredAndSortedReviews.length})</h3>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm đánh giá..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter by Rating */}
              <div className="relative">
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-4 h-4 fill-yellow-400" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value as FilterOption)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white hover:border-blue-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                  <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                  <option value="3">⭐⭐⭐ (3 sao)</option>
                  <option value="2">⭐⭐ (2 sao)</option>
                  <option value="1">⭐ (1 sao)</option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                {sortBy === 'newest' || sortBy === 'oldest' ? (
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                ) : (
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                )}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white hover:border-blue-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="newest">🕐 Mới nhất</option>
                  <option value="oldest">🕐 Cũ nhất</option>
                  <option value="highest">⭐ Đánh giá cao nhất</option>
                  <option value="lowest">⭐ Đánh giá thấp nhất</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || filterRating !== 'all') && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Đang lọc:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                    Tìm kiếm: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">×</button>
                  </span>
                )}
                {filterRating !== 'all' && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-2">
                    {filterRating} sao
                    <button onClick={() => setFilterRating('all')} className="hover:text-yellow-900">×</button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterRating('all');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredAndSortedReviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2">
                  {searchQuery || filterRating !== 'all' 
                    ? 'Không tìm thấy đánh giá phù hợp' 
                    : 'Chưa có đánh giá nào cho sản phẩm này'}
                </p>
                {isLoggedIn && !userHasReviewed && !searchQuery && filterRating === 'all' && (
                  <Button
                    onClick={() => {
                      setEditingReview(null);
                      setRating(5);
                      setComment('');
                      setShowReviewDialog(true);
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 mt-4"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Viết Đánh Giá Đầu Tiên
                  </Button>
                )}
              </div>
            ) : (
              paginatedReviews.map((review, index) => (
                <Card
                  key={review.id}
                  className="border-none shadow-md hover:shadow-xl transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                            {review.userName?.charAt(0).toUpperCase() || <User className="w-7 h-7" />}
                          </div>
                          {/* Rating badge on avatar */}
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <span className="text-xs font-black text-white">{review.rating}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-bold text-gray-900 text-lg">
                              {review.userName || 'Người dùng'}
                            </div>
                            {user?.id === review.userId && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                Bạn
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {renderStars(review.rating, false, 'sm')}
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user?.id === review.userId && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReview(review)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteReview(review.id)}
                            className="hover:shadow-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="pl-[72px]">
                      <p className="text-gray-700 leading-relaxed text-base">{review.comment}</p>
                      {review.updatedAt !== review.createdAt && (
                        <p className="text-xs text-gray-400 mt-2 italic">
                          Đã chỉnh sửa: {new Date(review.updatedAt).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredAndSortedReviews.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAndSortedReviews.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
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
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
              <Label className="text-lg font-bold mb-3 block">Đánh giá của bạn</Label>
              <div className="flex items-center gap-4">
                {renderStars(rating, true, 'lg')}
                <div className="flex-1">
                  <p className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {rating === 5 && '🎉 Tuyệt vời!'}
                    {rating === 4 && '😊 Rất tốt'}
                    {rating === 3 && '👍 Tốt'}
                    {rating === 2 && '😐 Tạm được'}
                    {rating === 1 && '😞 Không hài lòng'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
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
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-6 font-bold"
            >
              {editingReview ? '💾 Cập Nhật Đánh Giá' : '📝 Gửi Đánh Giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
