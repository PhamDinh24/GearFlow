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
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Star, 
  MessageSquare, 
  Edit, 
  Trash2, 
  AlertCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ReceiptText
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
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [editingReview, setEditingReview] = useState<ReviewDTO | null>(null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrder(id!);
      setOrder(data);
      
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
          if (review) reviewsMap[productId] = review;
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
      toast.success('Đã hủy đơn hàng thành công 🛑');
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
      toast.error('Vui lòng chia sẻ nhiều hơn (ít nhất 10 ký tự)');
      return;
    }

    try {
      if (editingReview) {
        await reviewApi.updateReview(editingReview.id, { rating, comment });
        toast.success('Đánh giá đã được nâng cấp ✨');
      } else {
        await reviewApi.createReview({ productId: reviewingProduct.id, rating, comment });
        toast.success('Cảm ơn bạn đã đóng góp cho cộng đồng GearFlow 🎉');
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
    PENDING: { label: 'CHỜ XÁC NHẬN', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    PROCESSING: { label: 'ĐANG XỬ LÝ', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
    SHIPPED: { label: 'ĐANG GIAO', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
    DELIVERED: { label: 'HOÀN THÀNH', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    CANCELLED: { label: 'ĐÃ HỦY', color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Đang trích xuất dữ liệu vận đơn...</p>
      </div>
    );
  }

  if (!order) return null;
  const status = statusMap[order.status] || statusMap.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <Link to="/orders" className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
              Quay lại danh sách
            </Link>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              CHI TIẾT ĐƠN HÀNG
            </h1>
            <p className="text-xl text-slate-400 font-bold mt-4 uppercase tracking-widest">
              Thông tin hành trình đơn <span className="text-slate-900">#{order.id.substring(0, 8)}</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 border-slate-50 flex items-center gap-8">
             <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${status.bg} ${status.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <StatusIcon className="w-7 h-7" />
                </div>
                <div className="pr-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</div>
                  <div className={`text-xl font-black ${status.color} tracking-tighter uppercase`}>{status.label}</div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Items Card */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border-2 border-slate-50 overflow-hidden">
               <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-slate-900">
                    <Package className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Danh mục sản phẩm</h2>
               </div>
               <div className="p-10 space-y-10">
                  {order.items?.map((item, idx) => {
                    const productReview = reviews[item.productId];
                    const canReview = order.status === 'DELIVERED';
                    
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-8 p-8 rounded-[2.5rem] bg-slate-50/50 border-2 border-white shadow-inner group transition-all duration-500 hover:bg-white hover:shadow-xl hover:border-indigo-50">
                        <div className="w-32 h-32 rounded-[2rem] bg-white border-2 border-slate-100 overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img src={item.imageUrl || ''} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">{item.productName}</h4>
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl uppercase tracking-widest">Qty: {item.quantity}</span>
                            <span className="text-[10px] font-black text-slate-400 bg-white px-4 py-1.5 rounded-xl border border-slate-100 uppercase tracking-widest">Unit: {item.price?.toLocaleString('vi-VN')}đ</span>
                          </div>

                          {/* Review Action */}
                          {canReview && (
                            <div className="pt-4 mt-4 border-t border-slate-100">
                              {productReview ? (
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-4 px-5 py-2.5 bg-amber-50 rounded-2xl border-2 border-amber-100/50 shadow-lg shadow-amber-50">
                                    <Star className="w-5 h-5 text-amber-600 fill-amber-400" />
                                    <span className="text-xs font-black text-amber-700 uppercase tracking-widest">{productReview.rating}/5 Artisan Score</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleOpenReviewDialog(item.productId, item.productName)} className="w-10 h-10 rounded-xl border-2 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => handleDeleteReview(productReview.id)} className="w-10 h-10 rounded-xl border-2 border-slate-100 hover:bg-rose-50 hover:text-rose-600">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => handleOpenReviewDialog(item.productId, item.productName)}
                                  className="h-12 px-8 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
                                >
                                  ĐÁNH GIÁ SẢN PHẨM
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Subtotal</p>
                          <p className="text-3xl font-black text-slate-950 tracking-tighter">
                            {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Address & Payment Info Grid */}
            <div className="grid md:grid-cols-2 gap-12">
               <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border-2 border-slate-50 flex flex-col group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Shipping Destination</h3>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-4 leading-tight">{order.shippingAddress}</p>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{order.shippingCity}</p>
                  <div className="mt-auto pt-8 flex items-center gap-4 border-t border-slate-50">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-900 text-lg tracking-tighter">{order.shippingPhone || 'AUTHENTICATED'}</span>
                  </div>
               </div>

               <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border-2 border-slate-50 flex flex-col group">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Payment Protocol</h3>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{order.paymentMethod || 'COD'}</div>
                  </div>
                  <div className="mt-auto pt-8 flex items-center gap-4 border-t border-slate-50">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Transaction Secured & Verified</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Checkout Summary Column */}
          <aside className="lg:col-span-4 space-y-12">
             <div className="bg-slate-950 rounded-[4rem] p-12 text-white shadow-3xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-12 text-center">FINAL STATEMENT</h3>
                  
                  <div className="space-y-6 mb-12 border-b border-white/10 pb-12">
                    <div className="flex justify-between items-center opacity-60">
                      <span className="text-[10px] font-black uppercase tracking-widest">Net Amount</span>
                      <span className="font-bold text-lg">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                      <span className="text-[10px] font-black uppercase tracking-widest">Logistic Fee</span>
                      <span className="font-bold text-lg">50,000đ</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                      <span className="text-[10px] font-black uppercase tracking-widest">Discount applied</span>
                      <span className="font-bold text-lg text-emerald-400">−0đ</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center mb-16">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Settlement Total</span>
                    <span className="text-6xl font-black text-white tracking-tighter leading-none">{((order.totalAmount || 0) + 50000).toLocaleString('vi-VN')}đ</span>
                  </div>

                  {order.status === 'PENDING' && (
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelOrder}
                      className="w-full h-20 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all hover:-translate-y-1.5 active:scale-95"
                    >
                      STOP TRANSACTION
                    </Button>
                  )}

                  <div className="mt-12 pt-12 border-t border-white/10">
                    <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                        <ReceiptText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Timestamp</p>
                        <p className="text-sm font-bold text-white uppercase">{new Date(order.createdAt).toLocaleDateString('vi-VN')} · {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Support Card */}
             <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border-2 border-slate-50 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <ShieldCheck className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-3">GearFlow Protection</h4>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8 leading-relaxed">Đơn hàng của bạn được bảo vệ bởi hệ thống an toàn GearFlow.</p>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                  LIÊN HỆ HỖ TRỢ
                </Button>
             </div>
          </aside>
        </div>
      </div>

      {/* Review Dialog System */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl bg-white rounded-[4rem] border-none shadow-3xl p-12 overflow-hidden" aria-describedby="review-desc">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-[80px] -z-10"></div>
          <DialogHeader className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Artisan Review</DialogTitle>
            </div>
            <DialogDescription id="review-desc" className="text-lg font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              CHIA SẺ CẢM NHẬN VỀ <span className="text-slate-950 border-b-2 border-amber-400">{reviewingProduct?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-12">
            {/* Rating Selector */}
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-white shadow-inner flex flex-col items-center">
              <div className="flex gap-4 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="transition-all transform hover:scale-125 active:scale-75"
                  >
                    <Star
                      className={`w-14 h-14 transition-all ${
                        star <= (hoveredStar || rating)
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                  {rating === 5 ? 'MASTERPIECE!' : rating === 4 ? 'GREAT EXPERIENCE' : rating === 3 ? 'GOOD QUALITY' : rating === 2 ? 'NEEDS IMPROVEMENT' : 'NOT SATISFIED'}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Current Score: {rating}.0</p>
              </div>
            </div>

            {/* Comment Field */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Your Detailed Feedback</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Mô tả trải nghiệm thực tế của bạn về chất âm, cảm giác gõ, hoàn thiện..."
                className="min-h-[180px] rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 p-8 font-bold text-lg resize-none shadow-inner focus:ring-4 focus:ring-amber-50 transition-all"
              />
              <div className="flex justify-between px-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${comment.length < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {comment.length < 10 ? `REQUIRED: ${10 - comment.length} MORE CHARS` : 'PROTOCOL CLEAR'}
                </span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{comment.length}/500</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-16 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              className="flex-1 h-16 rounded-2xl border-2 border-slate-100 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              HỦY BỎ
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={comment.trim().length < 10}
              className="flex-[2] h-16 bg-slate-950 hover:bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all"
            >
              {editingReview ? 'UPDATE BROADCAST' : 'SUBMIT TO COMMUNITY'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
