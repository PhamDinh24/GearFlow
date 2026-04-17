import { BaseApiService } from './base';

class StockApiService extends BaseApiService {
  async updateStock(variantId: string, quantity: number): Promise<any> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/admin/stock/${variantId}`, { quantity }),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<any>(response);
  }
}

export const stockApi = new StockApiService();
