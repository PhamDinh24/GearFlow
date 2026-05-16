import api from './http';

export interface ProductVariant {
  id: string;
  productId: string;
  switchType?: string;
  color?: string;
  keycapSet?: string;
  connectionType?: string;
  priceModifier: number;
  finalPrice: number;
  stock: number;
  inStock: boolean;
}

export interface CreateVariantRequest {
  switchType?: string;
  color?: string;
  keycapSet?: string;
  connectionType?: string;
  priceModifier: number;
  stock: number;
}

export interface UpdateVariantRequest {
  switchType?: string;
  color?: string;
  keycapSet?: string;
  connectionType?: string;
  priceModifier?: number;
  stock?: number;
}

export const variantService = {
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  },

  async createVariant(productId: string, data: CreateVariantRequest): Promise<ProductVariant> {
    const response = await api.post(`/products/${productId}/variants`, data);
    return response.data;
  },

  async updateVariant(variantId: string, data: UpdateVariantRequest): Promise<ProductVariant> {
    const response = await api.put(`/products/admin/variants/${variantId}`, data);
    return response.data;
  },

  async deleteVariant(variantId: string): Promise<void> {
    await api.delete(`/products/admin/variants/${variantId}`);
  },

  async updateStock(variantId: string, stock: number): Promise<any> {
    const response = await api.put(`/products/admin/stock/${variantId}`, { stock });
    return response.data;
  },

  async reserveStock(variantId: string, quantity: number): Promise<void> {
    await api.post(`/products/admin/stock/${variantId}/reserve`, { quantity });
  },
};
