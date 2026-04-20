import React, { useState, useEffect } from 'react';
import { reviewApi, ReviewDTO, productApi } from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Pagination } from '../ui/pagination';
import { AdminPageWrapper } from './PageWrapper';
import {
  Star,
  Search,
  Trash2,
  User,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCcw,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

export function Reviews() {
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [products, setProducts] = useState<Map<string, string>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Note: Backend needs to implement /admin/reviews endpoint
      // For now, we'll load reviews from all products
      const productsRes = await productApi.getProducts(0, 1000);
      const productsData = Array.isArray(productsRes) ? productsRes : productsRes.content || [];
      
      // Create product map
      const productMap = new Map();
      productsData.forEach((p: any) => productMap.set(p.id, p.name));
      setProducts(productMap);

      // Load reviews for all products
      const allReviews: ReviewDTO[] = [];
      for (const product of productsData) {
        try {
          const productReviews = await reviewApi.getProductReviews(product.id);
          allReviews.push(...productReviews);
        } catch (error) {
          console.error(`Error loading reviews for product ${product.id}:`, error);
        }
      }
      
      // Sort reviews by createdAt (newest first)
      const sortedReviews = allReviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setReviews(sortedReviews);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Xóa đánh giá thành công');
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Không thể xóa đánh giá');
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      products.get(review.productId)?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'ALL' || review.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, ratingFilter]);

  // Calculate stats
  const stats = {
    total: reviews.length,
    excellent: reviews.filter((r) => r.rating === 5).length,
    good: reviews.filter((r) => r.rating >= 4).length,
    average: reviews.filter((r) => r.rating === 3).length,
    poor: reviews.filter((r) => r.rating <= 2).length,
    averageRating:
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0',
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Quản Lý Đánh Giá"
      description="Quản lý đánh giá và phản hồi của khách hàng"
      actions={
        <Button onClick={loadData} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng Đánh Giá</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trung Bình</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">5 Sao</p>
                <p className="text-2xl font-bold">{stats.excellent}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">4-5 Sao</p>
                <p className="text-2xl font-bold">{stats.good}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">≤ 2 Sao</p>
                <p className="text-2xl font-bold">{stats.poor}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle>Danh Sách Đánh Giá</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm đánh giá, sản phẩm, người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="border rounded px-4 py-2 min-w-[150px]"
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))
                }
              >
                <option value="ALL">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {paginatedReviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || ratingFilter !== 'ALL'
                  ? 'Không tìm thấy đánh giá nào'
                  : 'Chưa có đánh giá nào'}
              </div>
            ) : (
              paginatedReviews.map((review) => (
                <Card
                  key={review.id}
                  className="border hover:shadow-md transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* User Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                          {review.userName?.charAt(0).toUpperCase() || (
                            <User className="w-6 h-6" />
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-gray-900">
                              {review.userName || 'Người dùng'}
                            </span>
                            {renderStars(review.rating)}
                            <Badge
                              variant={
                                review.rating >= 4
                                  ? 'default'
                                  : review.rating === 3
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className={
                                review.rating >= 4
                                  ? 'bg-green-100 text-green-800'
                                  : review.rating === 3
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {review.rating} sao
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            Sản phẩm:{' '}
                            <span className="font-semibold text-gray-900">
                              {products.get(review.productId) || review.productId}
                            </span>
                          </p>

                          <p className="text-gray-700 leading-relaxed mb-2">{review.comment}</p>

                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredReviews.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReviews.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageWrapper>
  );
}
