import { BaseApiService } from './base';
import { ProductVariantDTO } from '../../types';

class ProductVariantApiService extends BaseApiService {
  async getVariants(productId: string): Promise<ProductVariantDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/${productId}/variants`),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<ProductVariantDTO[]>(response);
  }

  async getVariant(productId: string, variantId: string): Promise<ProductVariantDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/${productId}/variants/${variantId}`),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<ProductVariantDTO>(response);
  }

  async createVariant(productId: string, data: Partial<ProductVariantDTO>): Promise<ProductVariantDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/${productId}/variants`),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ProductVariantDTO>(response);
  }

  async updateVariant(productId: string, variantId: string, data: Partial<ProductVariantDTO>): Promise<ProductVariantDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/${productId}/variants/${variantId}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ProductVariantDTO>(response);
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/${productId}/variants/${variantId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete variant: ${response.status}`);
    }
  }
}

export const productVariantApi = new ProductVariantApiService();