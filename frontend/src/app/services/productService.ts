import api from './http';

export interface ProductAttribute {
  id: string;
  productId: string;
  name: string;
  value: string;
  priceAdjustment: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  switchType: string | null;
  color: string | null;
  keycapSet: string | null;
  connectionType: string | null;
  priceModifier: number;
  finalPrice: number;
  availableStock: number;
  stock: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  brandId: string;
  support: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  averageRating: number | null;
  reviewCount: number;
  stock: number;
  active: boolean;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const productService = {
  async getAllProducts(page = 0, size = 10): Promise<ProductPage> {
    const response = await api.get('/products', {
      params: { page, size },
    });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async searchProducts(keyword: string, page = 0, size = 10): Promise<ProductPage> {
    const response = await api.get('/products/search', {
      params: { keyword, page, size },
    });
    return response.data;
  },

  async filterProducts(
    filters: {
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      layout?: string;
      connectionType?: string;
    },
    page = 0,
    size = 10
  ): Promise<ProductPage> {
    const response = await api.get('/products/filter', {
      params: { ...filters, page, size },
    });
    return response.data;
  },

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  },

  async getRelatedProducts(productId: string, limit = 6): Promise<Product[]> {
    const response = await api.get(`/products/${productId}/related`, {
      params: { limit },
    });
    return response.data;
  },

  async getLatestProducts(limit = 6): Promise<Product[]> {
    const response = await api.get('/products/latest', {
      params: { limit },
    });
    return response.data;
  },

  async getBestSellingProducts(limit = 6): Promise<Product[]> {
    const response = await api.get('/products/featured', {
      params: { limit },
    });
    return response.data;
  },

  async getBrands(): Promise<Array<{ id: string; name: string; logoUrl?: string }>> {
    const response = await api.get('/products/brands');
    return response.data;
  },

  async getCategories(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await api.get('/products/categories');
    return response.data;
  },
};
