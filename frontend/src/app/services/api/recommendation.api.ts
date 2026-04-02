import { BaseApiService } from './base';
import { ProductDTO } from '../../types';

class RecommendationApiService extends BaseApiService {
  constructor() {
    super('/products');
  }

  async getRecommendations(productId: string, limit: number = 6): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/${productId}/recommendations?limit=${limit}`);
    return this.handleResponse<ProductDTO[]>(response);
  }

  async getSameBrandProducts(productId: string, limit: number = 6): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/${productId}/same-brand?limit=${limit}`);
    return this.handleResponse<ProductDTO[]>(response);
  }

  async getSameCategoryProducts(productId: string, limit: number = 6): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/${productId}/same-category?limit=${limit}`);
    return this.handleResponse<ProductDTO[]>(response);
  }
}

export const recommendationApi = new RecommendationApiService();
