import { BaseApiService } from './base';

class AdminApiService extends BaseApiService {
  async getDashboardStats(): Promise<any> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/admin/dashboard/stats'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<any>(response);
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/dashboard/top-products?limit=${limit}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<any[]>(response);
  }

  async getSalesReport(startDate: string, endDate: string): Promise<any> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/dashboard/sales-report?startDate=${startDate}&endDate=${endDate}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<any>(response);
  }

  async exportOrders(): Promise<Blob> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/admin/export/orders'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return response.blob();
  }

  async exportProducts(): Promise<Blob> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/admin/export/products'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return response.blob();
  }

  async bulkDeleteProducts(productIds: string[]): Promise<void> {
    await this.fetchWithTimeout(
      this.buildUrl('/admin/bulk/products/delete'),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
        body: JSON.stringify(productIds),
      }
    );
  }

  async bulkUpdateCategory(productIds: string[], categoryId: string): Promise<void> {
    await this.fetchWithTimeout(
      this.buildUrl(`/admin/bulk/products/update-category?categoryId=${categoryId}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(productIds),
      }
    );
  }

  // Order Management
  async getAllOrders(): Promise<any[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/admin/orders'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<any[]>(response);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/orders/${orderId}/status`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ status }),
      }
    );
    return this.handleResponse<any>(response);
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

export const adminApi = new AdminApiService();
