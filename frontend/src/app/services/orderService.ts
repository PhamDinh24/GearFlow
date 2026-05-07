import api from './http';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
}

export const orderService = {
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/orders', request);
    return response.data;
  },

  async getUserOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // Admin methods
  async getAllOrders(status?: string): Promise<Order[]> {
    const params = status ? { status } : {};
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await api.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  async adminCancelOrder(orderId: string): Promise<Order> {
    const response = await api.post(`/admin/orders/${orderId}/cancel`);
    return response.data;
  },
};
