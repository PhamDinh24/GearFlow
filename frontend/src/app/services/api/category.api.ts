import { BaseApiService } from './base';
import { CategoryDTO } from '../../types';

class CategoryApiService extends BaseApiService {
  async getCategories(): Promise<CategoryDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products/categories'),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<CategoryDTO[]>(response);
  }

  async getCategoryById(id: string): Promise<CategoryDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/categories/${id}`),
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<CategoryDTO>(response);
  }

  async createCategory(data: { name: string; description?: string }): Promise<CategoryDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products/categories'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<CategoryDTO>(response);
  }

  async updateCategory(id: string, data: { name: string; description?: string }): Promise<CategoryDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/categories/${id}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<CategoryDTO>(response);
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/categories/${id}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.status}`);
    }
  }
}

export const categoryApi = new CategoryApiService();
