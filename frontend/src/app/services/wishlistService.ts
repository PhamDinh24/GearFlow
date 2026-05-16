import api from './http';
import { Product } from './productService';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export const wishlistService = {
  async getWishlist(): Promise<{ items: WishlistItem[] }> {
    const response = await api.get('/wishlist');
    // Backend returns array directly, wrap it in object for consistency
    const items = Array.isArray(response.data) ? response.data : response.data.items || [];
    return { items };
  },

  async addToWishlist(productId: string): Promise<WishlistItem> {
    try {
      const response = await api.post(`/wishlist/${productId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Sản phẩm đã có trong danh sách yêu thích';
        throw new Error(message);
      }
      throw error;
    }
  },

  async removeFromWishlist(productId: string): Promise<void> {
    await api.delete(`/wishlist/${productId}`);
  },

  async checkInWishlist(productId: string): Promise<boolean> {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data.inWishlist;
  },
};
