import { BaseApiService } from './base';
import { BrandDTO } from '../../types';

class BrandApiService extends BaseApiService {
  async getBrands(): Promise<BrandDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products/brands'),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<BrandDTO[]>(response);
  }

  async createBrand(data: { name: string; description?: string }): Promise<BrandDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products/admin/brands'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<BrandDTO>(response);
  }

  async updateBrand(id: string, data: { name: string; description?: string }): Promise<BrandDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/admin/brands/${id}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<BrandDTO>(response);
  }

  async deleteBrand(id: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/admin/brands/${id}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete brand: ${response.status}`);
    }
  }
}

export const brandApi = new BrandApiService();
