import { BaseApiService } from './base';
import { ProductDTO } from '../../types';

class RecommendationApiService extends BaseApiService {
  async getRelatedProducts(productId: string, limit: number = 6): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/products/${productId}/related`, { limit }),
      { headers: this.getHeaders(false) }
    );
    return this.handleResponse<ProductDTO[]>(response);
  }

  async getLatestProducts(limit: number = 6): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products/latest', { limit }),
      { headers: this.getHeaders(false) }
    );
    return this.handleResponse<ProductDTO[]>(response);
  }

  async getBestSellingProducts(limit: number = 6): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/products/best-selling', { limit }),
      { headers: this.getHeaders(false) }
    );
    return this.handleResponse<ProductDTO[]>(response);
  }
}

class CustomerRecommendationApiService extends BaseApiService {
  async getCustomerRelatedProducts(limit: number = 10): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/recommendations/customer-related', { limit }),
      { headers: this.getHeaders(true) }
    );
    return this.handleResponse<ProductDTO[]>(response);
  }

  async getPopularInCategory(categoryId: string, limit: number = 10): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/recommendations/customer-popular/${categoryId}`, { limit }),
      { headers: this.getHeaders(true) }
    );
    return this.handleResponse<ProductDTO[]>(response);
  }

  async getCrossSellRecommendations(productId: string, limit: number = 10): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/recommendations/customer-crosssell/${productId}`, { limit }),
      { headers: this.getHeaders(true) }
    );
    return this.handleResponse<ProductDTO[]>(response);
  }

  async getRandomProducts(limit: number = 10): Promise<ProductDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/recommendations/random', { limit }),
      { headers: this.getHeaders(false) }
    );
    return this.handleResponse<ProductDTO[]>(response);
  }
}

export const recommendationApi = new RecommendationApiService();
export const customerRecommendationApi = new CustomerRecommendationApiService();
