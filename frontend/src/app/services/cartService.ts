import api from './http';

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  imageUrl: string;
  variantDetails: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(variantId: string, quantity: number): Promise<Cart> {
    const response = await api.post('/cart/items', {
      variantId,
      quantity,
    });
    return response.data;
  },

  async updateCartItem(variantId: string, quantity: number): Promise<Cart> {
    const response = await api.put(`/cart/items/${variantId}`, null, {
      params: { quantity },
    });
    return response.data;
  },

  async removeCartItem(variantId: string): Promise<Cart> {
    const response = await api.delete(`/cart/items/${variantId}`);
    return response.data;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },
};
