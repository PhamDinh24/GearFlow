import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { orderApi, reviewApi } from "../../services/api";
import { OrderDTO, ReviewDTO } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, Package, MapPin, Phone, CreditCard, ChevronRight, CheckCircle2, Truck, Clock, Star, MessageSquare, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Record<string, ReviewDTO>>({});
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [editingReview, setEditingReview] = useState<ReviewDTO | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await orderApi.getOrder(orderId!);
      setOrder(data);
      
      // Load reviews for all products in the order
      if (data.items) {
        const reviewPromises = data.items.map(async (item) => {
          try {
            const productReviews = await reviewApi.getProductReviews(item.productId);
            const userReview = productReviews.find(r => r.userId === user?.id);
            return { productId: item.productId, review: userReview };
          } catch (error) {
            return { productId: item.productId, review: undefined };
          }
        });
        
        const reviewResults = await Promise.all(reviewPromises);
        const reviewsMap: Record<string, ReviewDTO> = {};
        reviewResults.forEach(({ productId, review }) => {
          if (review) {
            reviewsMap[productId] = review;
          }
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
      toast.success('Đã hủy đơn hàng');
      loadOrder();
    } catch (error) {
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const handleOpenReviewDialog = (productId: string, productName: string) => {
    const existingReview = reviews[productId];
    if (existingReview) {
      setEditingReview(existingReview);
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setEditingReview(null);
      setRating(5);
      setComment('');
    }
    setReviewingProduct({ id: productId, name: productName });
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingProduct) return;
    
    if (comment.trim().length < 10) {
      toast.error('Đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    try {
      if (editingReview) {
        await reviewApi.updateReview(editingReview.id, { rating, comment });
        toast.success('Cập nhật đánh giá thành công!');
      } else {
        await reviewApi.createReview({ 
          productId: reviewingProduct.id, 
          rating, 
          comment 
        });
        toast.success('Đánh giá thành công! Cảm ơn bạn đã chia sẻ.');
      }
      setShowReviewDialog(false);
      setReviewingProduct(null);
      setEditingReview(null);
      setRating(5);
      setComment('');
      await loadOrder();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Không thể gửi đánh giá';
      toast.error(errorMessage);
    }
  };

  const handleDeleteReview = async (reviewId: string, productId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Xóa đánh giá thành công');
      await loadOrder();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Không thể xóa đánh giá');
    }
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

  const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    PENDING: { label: 'Chờ xử lý', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    PROCESSING: { label: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
    SHIPPED: { label: 'Đang giao', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
    DELIVERED: { label: 'Đã hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowLeft },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) return null;
  const status = statusMap[order.status] || statusMap.PENDING;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Detail Header Banner */}
      <section className="bg-slate-950 text-white py-12 relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <div>
            <Link to="/orders" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại lịch sử</span>
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tighter">ĐƠN HÀNG #{order.id.substring(0, 8)}</h1>
          </div>
          <div className={`hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl ${status.bg} ${status.color} border border-current opacity-70`}>
             <status.icon className="w-5 h-5" />
             <span className="font-black uppercase tracking-widest text-xs">{status.label}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none rounded-[2.5rem] shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
                  <CardTitle className="text-xl font-black tracking-tighter uppercase text-slate-900">Chi tiết sản phẩm</CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="space-y-6">
                    {order.items?.map((item, idx) => {
                      const productReview = reviews[item.productId];
                      const canReview = order.status === 'DELIVERED';
                      
                      return (
                        <div key={idx} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                          <div className="flex gap-6 items-start">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                              <img src={item.imageUrl || ''} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-lg mb-1">{item.productName || `Sản phẩm #${item.productId.substring(0, 4)}`}</h4>
                              <p className="text-xs text-slate-500 font-medium mb-2">Số lượng: {item.quantity}</p>
                              
                              {/* Review Status */}
                              {productReview ? (
                                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {renderStars(productReview.rating, false, 'sm')}
                                      <span className="text-xs font-bold text-yellow-700">Đã đánh giá</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleOpenReviewDialog(item.productId, item.productName || 'Sản phẩm')}
                                        className="h-7 px-2 hover:bg-yellow-100"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteReview(productReview.id, item.productId)}
                                        className="h-7 px-2 hover:bg-red-100 hover:text-red-600"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-700 line-clamp-2">{productReview.comment}</p>
                                </div>
                              ) : canReview && (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenReviewDialog(item.productId, item.productName || 'Sản phẩm')}
                                  className="mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 h-8 text-xs font-bold"
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Đánh giá sản phẩm
                                </Button>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-900">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-none rounded-3xl shadow-sm bg-white p-8">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-blue-600" /> Địa chỉ giao hàng
                  </h4>
                  <p className="font-bold text-slate-900 mb-1">{order.shippingAddress}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{order.shippingCity}</p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3 text-slate-900">
                     <Phone className="w-4 h-4 text-slate-400" />
                     <span className="font-bold text-sm">{order.shippingPhone || 'Chưa cập nhật'}</span>
                  </div>
               </Card>

               <Card className="border-none rounded-3xl shadow-sm bg-white p-8">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                     <CreditCard className="w-4 h-4 text-blue-600" /> Phương thức thanh toán
                  </h4>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                        <CreditCard className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900">{order.paymentMethod || 'COD'}</p>
                        <p className="text-[10px] uppercase font-black text-emerald-600">Đã xác nhận</p>
                     </div>
                  </div>
               </Card>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <aside className="space-y-8">
             <Card className="border-none rounded-[2.5rem] shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <CardHeader className="bg-slate-950 p-6 text-white text-center">
                   <CardTitle className="text-sm font-black tracking-widest uppercase">Tổng kết đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-medium">Tạm tính</span>
                         <span className="font-bold text-slate-900">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-medium">Phí vận chuyển</span>
                         <span className="font-bold text-slate-900">50,000đ</span>
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng</p>
                            <p className="text-3xl font-black text-blue-600 tracking-tighter">{((order.totalAmount || 0) + 50000).toLocaleString('vi-VN')}đ</p>
                         </div>
                      </div>
                   </div>

                   {order.status === 'PENDING' && (
                     <Button 
                       variant="destructive" 
                       className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-200"
                       onClick={handleCancelOrder}
                     >
                        Hủy đơn hàng
                     </Button>
                   )}

                   <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                         <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Thời gian đặt</p>
                         <p className="text-xs font-bold text-slate-900">{new Date(order.createdAt).toLocaleTimeString('vi-VN')} {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </aside>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="review-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingReview ? '✏️ Chỉnh Sửa Đánh Giá' : '⭐ Đánh Giá Sản Phẩm'}
            </DialogTitle>
            <DialogDescription id="review-dialog-description" className="text-base">
              Chia sẻ trải nghiệm của bạn về <span className="font-semibold text-gray-900">{reviewingProduct?.name}</span>
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
                setReviewingProduct(null);
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
