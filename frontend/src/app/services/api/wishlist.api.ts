import { BaseApiService } from './base';
import type { WishlistDTO } from '../../types';

class WishlistApiService extends BaseApiService {
  /**
   * Get user's wishlist
   */
  async getWishlist(): Promise<WishlistDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/wishlist'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<WishlistDTO[]>(response);
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<WishlistDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/wishlist/${productId}`),
      {
        method: 'POST',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<WishlistDTO>(response);
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/wishlist/${productId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to remove from wishlist: ${response.status}`);
    }
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: string): Promise<boolean> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/wishlist/check/${productId}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<boolean>(response);
  }
}

export const wishlistApi = new WishlistApiService();
