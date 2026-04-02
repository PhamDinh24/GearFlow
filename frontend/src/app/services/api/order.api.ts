import { BaseApiService } from './base';
import { OrderDTO, OrderRequest } from '../../types';

class OrderApiService extends BaseApiService {
  async createOrder(data: OrderRequest): Promise<OrderDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/orders'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<OrderDTO>(response);
  }

  async getOrders(): Promise<OrderDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/orders'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<OrderDTO[]>(response);
  }

  async getOrder(orderId: string): Promise<OrderDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/orders/${orderId}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<OrderDTO>(response);
  }

  async getAllOrders(): Promise<OrderDTO[]> {
    try {
      const response = await this.fetchWithTimeout(
        this.buildUrl('/admin/orders'),
        {
          method: 'GET',
          headers: this.getHeaders(true),
        }
      );
      return this.handleResponse<OrderDTO[]>(response);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/orders/${orderId}/status`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ status }),
      }
    );
    return this.handleResponse<OrderDTO>(response);
  }

  async cancelOrder(orderId: string): Promise<OrderDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/orders/${orderId}/cancel`),
      {
        method: 'POST',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<OrderDTO>(response);
  }
}

export const orderApi = new OrderApiService();
