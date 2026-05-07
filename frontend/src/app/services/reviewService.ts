import api from './http';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  async getProductReviews(productId: string): Promise<Review[]> {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  async getAverageRating(productId: string): Promise<number> {
    const response = await api.get(`/reviews/product/${productId}/rating`);
    return response.data.averageRating;
  },

  async createReview(request: CreateReviewRequest): Promise<Review> {
    const response = await api.post('/reviews', request);
    return response.data;
  },

  async updateReview(reviewId: string, rating: number, comment: string): Promise<Review> {
    const response = await api.put(`/reviews/${reviewId}`, {
      rating,
      comment,
    });
    return response.data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Admin methods
  async getAllReviews(): Promise<Review[]> {
    try {
      const response = await api.get('/admin/reviews');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all reviews:', error);
      return [];
    }
  },

  async updateReviewStatus(reviewId: string, status: 'approved' | 'pending' | 'rejected'): Promise<Review> {
    const response = await api.put(`/admin/reviews/${reviewId}/status`, { status });
    return response.data;
  },
};
