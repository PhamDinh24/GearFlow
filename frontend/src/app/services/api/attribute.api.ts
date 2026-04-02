import { BaseApiService } from './base';
import { AttributeDefinitionDTO } from '../../types';

class AttributeApiService extends BaseApiService {
  constructor() {
    super('/attribute-definitions');
  }

  async getAllAttributes(): Promise<AttributeDefinitionDTO[]> {
    const response = await this.fetchWithTimeout(this.baseUrl);
    return this.handleResponse<AttributeDefinitionDTO[]>(response);
  }

  async getFilterableAttributes(): Promise<AttributeDefinitionDTO[]> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/filterable`);
    return this.handleResponse<AttributeDefinitionDTO[]>(response);
  }

  async getVariantAttributes(): Promise<AttributeDefinitionDTO[]> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/variant`);
    return this.handleResponse<AttributeDefinitionDTO[]>(response);
  }

  async getAttributeById(id: string): Promise<AttributeDefinitionDTO> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/${id}`);
    return this.handleResponse<AttributeDefinitionDTO>(response);
  }

  async createAttribute(data: Partial<AttributeDefinitionDTO>): Promise<AttributeDefinitionDTO> {
    const response = await this.fetchWithTimeout(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<AttributeDefinitionDTO>(response);
  }

  async updateAttribute(id: string, data: Partial<AttributeDefinitionDTO>): Promise<AttributeDefinitionDTO> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<AttributeDefinitionDTO>(response);
  }

  async deleteAttribute(id: string): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw await this.handleResponse(response);
    }
  }
}

export const attributeApi = new AttributeApiService();
