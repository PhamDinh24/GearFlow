import api from './http';

export interface ShippingAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

export interface CreateShippingAddressRequest {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault?: boolean;
}

export const shippingAddressService = {
  async getAddresses(): Promise<ShippingAddress[]> {
    const response = await api.get('/shipping-addresses');
    return response.data;
  },

  async getAddressById(id: string): Promise<ShippingAddress> {
    const response = await api.get(`/shipping-addresses/${id}`);
    return response.data;
  },

  async createAddress(request: CreateShippingAddressRequest): Promise<ShippingAddress> {
    const response = await api.post('/shipping-addresses', request);
    return response.data;
  },

  async updateAddress(id: string, request: CreateShippingAddressRequest): Promise<ShippingAddress> {
    const response = await api.put(`/shipping-addresses/${id}`, request);
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/shipping-addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<ShippingAddress> {
    const response = await api.post(`/shipping-addresses/${id}/set-default`);
    return response.data;
  },
};
