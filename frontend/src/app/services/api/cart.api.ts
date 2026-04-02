import { BaseApiService } from './base';
import { CartDTO } from '../../types';

class CartApiService extends BaseApiService {
  async getCart(): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/cart'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<CartDTO>(response);
  }

  async addToCart(variantId: string, quantity: number): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/cart/items'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ variantId, quantity }),
      }
    );
    return this.handleResponse<CartDTO>(response);
  }

  async updateCartItem(variantId: string, quantity: number): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/cart/items/${variantId}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ quantity }),
      }
    );
    return this.handleResponse<CartDTO>(response);
  }

  async removeFromCart(variantId: string): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/cart/items/${variantId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<CartDTO>(response);
  }

  async clearCart(): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/cart'),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.status}`);
    }
  }
}

export const cartApi = new CartApiService();
