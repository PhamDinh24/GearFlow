import { BaseApiService } from './base';
import { ShippingAddressDTO } from '../../types';

class ShippingApiService extends BaseApiService {
  async getShippingAddresses(): Promise<ShippingAddressDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/shipping-addresses'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<ShippingAddressDTO[]>(response);
  }

  async getDefaultShippingAddress(): Promise<ShippingAddressDTO | null> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/shipping-addresses/default'),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    if (response.status === 204) {
      return null;
    }
    return this.handleResponse<ShippingAddressDTO>(response);
  }

  async getShippingAddressById(id: string): Promise<ShippingAddressDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/shipping-addresses/${id}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<ShippingAddressDTO>(response);
  }

  async createShippingAddress(data: ShippingAddressDTO): Promise<ShippingAddressDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/shipping-addresses'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ShippingAddressDTO>(response);
  }

  async updateShippingAddress(id: string, data: ShippingAddressDTO): Promise<ShippingAddressDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/shipping-addresses/${id}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<ShippingAddressDTO>(response);
  }

  async deleteShippingAddress(id: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/shipping-addresses/${id}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete address: ${response.status}`);
    }
  }

  async setDefaultShippingAddress(id: string): Promise<ShippingAddressDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/shipping-addresses/${id}/set-default`),
      {
        method: 'POST',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<ShippingAddressDTO>(response);
  }
}

export const shippingApi = new ShippingApiService();
