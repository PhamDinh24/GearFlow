import { BaseApiService } from './base';

export interface ProductSuggestion {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  brandName: string;
}

export interface AiChatResponse {
  content: string;
  suggestions: ProductSuggestion[];
}

class AiApi extends BaseApiService {
  async chat(message: string): Promise<AiChatResponse> {
    const response = await this.fetchWithTimeout(this.buildUrl('/ai/chat'), {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ message }),
    });
    const data = await this.handleResponse<AiChatResponse>(response);
    return data;
  }

  async generateDescription(data: {
    name: string;
    brand: string;
    switchType: string;
    layout: string;
    extraFeatures: string;
  }): Promise<string> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/ai/admin/generate-description'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    const result = await this.handleResponse<{ content: string }>(response);
    return result.content;
  }
}

export const aiApi = new AiApi();
