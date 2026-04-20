import { BaseApiService } from './base';

export interface ReviewDTO {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  userName?: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

class ReviewApiService extends BaseApiService {
  // Create a review
  async createReview(data: CreateReviewRequest): Promise<ReviewDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/reviews'),
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ReviewDTO>(response);
  }

  // Update a review
  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<ReviewDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/reviews/${reviewId}`),
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ReviewDTO>(response);
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/reviews/${reviewId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
  }

  // Get reviews for a product
  async getProductReviews(productId: string): Promise<ReviewDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/reviews/product/${productId}`),
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<ReviewDTO[]>(response);
  }

  // Get average rating for a product
  async getAverageRating(productId: string): Promise<number> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/reviews/product/${productId}/rating`),
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    const data = await this.handleResponse<{ averageRating: number }>(response);
    return data.averageRating || 0;
  }

  // Get a single review
  async getReview(reviewId: string): Promise<ReviewDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/reviews/${reviewId}`),
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<ReviewDTO>(response);
  }

  // Admin: Get all reviews
  async getAllReviews(): Promise<ReviewDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/admin/reviews'),
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<ReviewDTO[]>(response);
  }

  // Admin: Delete any review
  async adminDeleteReview(reviewId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/reviews/${reviewId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete review');
    }
  }
}

export const reviewApi = new ReviewApiService();

