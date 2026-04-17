import { BaseApiService } from './base';
import { ProductDTO, PageResponse } from '../../types';

class ProductApiService extends BaseApiService {
  async getProducts(page = 0, size = 12): Promise<PageResponse<ProductDTO>> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products', { page, size }),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<PageResponse<ProductDTO>>(response);
  }

  async getProductById(id: string): Promise<ProductDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/${id}`),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<ProductDTO>(response);
  }

  async searchProducts(keyword: string, page = 0, size = 12): Promise<PageResponse<ProductDTO>> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products/search', { keyword, page, size }),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<PageResponse<ProductDTO>>(response);
  }

  async createProduct(data: Partial<ProductDTO>): Promise<ProductDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/admin/products'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ProductDTO>(response);
  }

  async updateProduct(id: string, data: Partial<ProductDTO>): Promise<ProductDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/products/${id}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ProductDTO>(response);
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/products/${id}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
  }

  async uploadProductImage(productId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/images/products/${productId}`),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await this.handleResponse<{ imageUrl: string }>(response);
    return data.imageUrl;
  }

  async deleteProductImage(productId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/images/products/${productId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete product image: ${response.status}`);
    }
  }
}

export const productApi = new ProductApiService();
