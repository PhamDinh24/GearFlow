import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { orderApi, reviewApi } from "../../services/api";
import { OrderDTO, ReviewDTO } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Star, 
  Edit, 
  Trash2, 
  XCircle,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Record<string, ReviewDTO>>({});
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string; orderItemId?: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [editingReview, setEditingReview] = useState<ReviewDTO | null>(null);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, user]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrder(id!);
      setOrder(data);
      
      if (data.items) {
        const reviewPromises = data.items.map(async (item) => {
          try {
            const productReviews = await reviewApi.getProductReviews(item.productId);
            // Try to find review by orderItemId first, then fallback to userId+productId for legacy reviews
            const userReview = productReviews.find(r => r.orderItemId === item.id) || 
                              productReviews.find(r => r.userId === user?.id && !r.orderItemId);
            return { orderItemId: item.id, review: userReview };
          } catch (error) {
            return { orderItemId: item.id, review: undefined };
          }
        });
        
        const reviewResults = await Promise.all(reviewPromises);
        const reviewsMap: Record<string, ReviewDTO> = {};
        reviewResults.forEach(({ orderItemId, review }) => {
          if (review) reviewsMap[orderItemId] = review;
        });
        setReviews(reviewsMap);
      }
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
      toast.success('Đã hủy đơn hàng thành công');
      loadOrder();
    } catch (error) {
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const handleReturnOrder = async () => {
    if (!order) return;
    try {
      await orderApi.requestReturn(order.id);
      toast.success('Đã gửi yêu cầu trả hàng');
      setShowReturnConfirm(false);
      loadOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể yêu cầu trả hàng');
    }
  };

  const handleOpenReviewDialog = (productId: string, productName: string, orderItemId: string) => {
    const existingReview = reviews[orderItemId];
    if (existingReview) {
      setEditingReview(existingReview);
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setEditingReview(null);
      setRating(5);
      setComment('');
    }
    setReviewingProduct({ id: productId, name: productName, orderItemId });
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingProduct) return;
    if (comment.trim().length < 10) {
      toast.error('Vui lòng chia sẻ nhiều hơn (ít nhất 10 ký tự)');
      return;
    }

    try {
      if (editingReview) {
        await reviewApi.updateReview(editingReview.id, { rating, comment });
        toast.success('Đánh giá đã được cập nhật');
      } else {
        await reviewApi.createReview({ 
          productId: reviewingProduct.id, 
          orderItemId: reviewingProduct.orderItemId,
          rating, 
          comment 
        });
        toast.success('Cảm ơn bạn đã đánh giá sản phẩm');
      }
      setShowReviewDialog(false);
      await loadOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Đã xóa đánh giá');
      await loadOrder();
    } catch (error: any) {
      toast.error('Không thể xóa đánh giá');
    }
  };

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
    PROCESSING: { label: 'Đang xử lý', color: 'text-blue-700', bg: 'bg-blue-100', icon: Package },
    SHIPPED: { label: 'Đang giao', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: Truck },
    DELIVERED: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
    CANCELLED: { label: 'Đã hủy', color: 'text-rose-700', bg: 'bg-rose-100', icon: XCircle },
    RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', color: 'text-orange-700', bg: 'bg-orange-100', icon: Package },
    RETURNED: { label: 'Đã trả hàng', color: 'text-gray-700', bg: 'bg-gray-100', icon: ArrowLeft },
    RETURN_REJECTED: { label: 'Từ chối trả hàng', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) return null;
  const status = statusMap[order.status] || statusMap.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách đơn hàng
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-500 text-sm">
              Đơn hàng <span className="font-semibold text-gray-900">#{order.id.substring(0, 8)}</span>
            </p>
          </div>

          <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${status.bg} ${status.color} rounded-lg flex items-center justify-center`}>
                  <StatusIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trạng thái</div>
                  <div className={`font-semibold ${status.color}`}>{status.label}</div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items List */}
            <Card className="overflow-hidden border border-gray-200">
               <CardHeader className="bg-white border-b border-gray-100 pb-4 pt-4 px-6">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <CardTitle className="text-lg">Sản phẩm đã đặt</CardTitle>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item, idx) => {
                      const productReview = reviews[item.id];
                      const canReview = order.status === 'DELIVERED';
                      
                      return (
                        <div key={idx} className="p-6 bg-white flex flex-col sm:flex-row gap-6">
                          <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-300" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-2">{item.productName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <span>Số lượng: {item.quantity}</span>
                              <span>Đơn giá: {item.price?.toLocaleString('vi-VN')}đ</span>
                            </div>

                            {/* Reviews */}
                            {canReview && (
                              <div className="mt-4">
                                {productReview ? (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-md text-sm font-medium">
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                      {productReview.rating}/5 sao
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenReviewDialog(item.productId, item.productName, item.id)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                      <Edit className="w-4 h-4 mr-2" /> Sửa
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteReview(productReview.id)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                                      <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenReviewDialog(item.productId, item.productName, item.id)}
                                  >
                                    Đánh giá sản phẩm
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-medium text-gray-900">
                              {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-white border-b border-gray-100 pb-4 pt-4 px-6">
                 <div className="flex items-center gap-3">
                   <MapPin className="w-5 h-5 text-gray-500" />
                   <CardTitle className="text-lg">Thông tin nhận hàng</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Địa chỉ</span>
                    <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                    <p className="text-gray-600 text-sm">{order.shippingCity}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-500 text-sm block mb-1">Số điện thoại</span>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {order.shippingPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Summary */}
          <aside className="lg:col-span-1 space-y-6">
             <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tiền hàng</span>
                      <span className="font-medium">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="font-medium">50,000đ</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
                    <span className="font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-indigo-600">{((order.totalAmount || 0) + 50000).toLocaleString('vi-VN')}đ</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-white p-3 rounded-md border border-gray-100 text-sm">
                      <span className="text-gray-500 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Phương thức</span>
                      <span className="font-semibold text-gray-900">{order.paymentMethod || 'COD'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-md border border-gray-100 text-sm">
                      <span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Thời gian đặt</span>
                      <span className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                
                {order.status === 'PENDING' && (
                  <div className="p-6 bg-white">
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelOrder}
                      className="w-full"
                    >
                      Hủy đơn hàng
                    </Button>
                  </div>
                )}
                {order.status === 'DELIVERED' && new Date(order.updatedAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000 && (
                  <div className="p-6 bg-white border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReturnConfirm(true)}
                      className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                    >
                      Yêu cầu trả hàng
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Bạn có thể trả hàng trong vòng 3 ngày sau khi nhận
                    </p>
                  </div>
                )}
             </Card>
          </aside>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription>
              Chia sẻ cảm nhận của bạn về <span className="font-semibold text-gray-900">{reviewingProduct?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-amber-600">
                {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tạm được' : 'Không hài lòng'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Chi tiết đánh giá</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (tối thiểu 10 ký tự)..."
                className="min-h-[120px]"
              />
              <p className={`text-xs ${comment.length < 10 && comment.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {comment.length}/500 ký tự {comment.length < 10 && '(cần ít nhất 10 ký tự)'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={comment.trim().length < 10}
            >
              {editingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Return Confirmation Dialog */}
      <Dialog open={showReturnConfirm} onOpenChange={setShowReturnConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Xác nhận trả hàng
            </DialogTitle>
            <DialogDescription className="py-4 text-base">
              Bạn có chắc chắn muốn yêu cầu trả hàng cho đơn hàng này? Việc trả hàng cần được sự đồng ý của cửa hàng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReturnConfirm(false)} className="flex-1">
              Hủy
            </Button>
            <Button 
              onClick={handleReturnOrder} 
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
