import api from './http';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts?: number;
  pendingOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders?: number;
  cancelledOrders?: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  imageUrl?: string;
  brandId?: string;
}

export interface TopBrand {
  brandId: string;
  brandName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByDay?: Array<{ date: string; revenue: number }>;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface OrderStatusDistribution {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const response = await api.get(`/admin/dashboard/top-products?limit=${limit}`);
    return response.data;
  },

  async getTopBrands(limit: number = 3): Promise<TopBrand[]> {
    const response = await api.get(`/admin/dashboard/top-brands?limit=${limit}`);
    return response.data;
  },

  async getSalesReport(startDate: string, endDate: string): Promise<SalesReport> {
    const response = await api.get('/admin/dashboard/sales-report', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Analytics
  async getProductAnalytics(): Promise<ProductAnalytics> {
    const response = await api.get('/admin/analytics/products');
    return response.data;
  },

  async getReviewAnalytics(): Promise<ReviewAnalytics> {
    const response = await api.get('/admin/analytics/reviews');
    return response.data;
  },

  async getOrderStatusDistribution(): Promise<OrderStatusDistribution> {
    const response = await api.get('/admin/analytics/order-status-distribution');
    return response.data;
  },

  async getTopRatedProducts(limit: number = 10): Promise<any[]> {
    const response = await api.get(`/admin/analytics/top-rated-products?limit=${limit}`);
    return response.data;
  },

  // Export
  async exportOrders(): Promise<Blob> {
    const response = await api.get('/admin/export/orders', {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportProducts(): Promise<Blob> {
    const response = await api.get('/admin/export/products', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Bulk Operations
  async bulkDeleteProducts(productIds: string[]): Promise<void> {
    await api.delete('/admin/bulk/products/delete', {
      data: productIds,
    });
  },

  async bulkUpdateProductCategory(productIds: string[], categoryId: string): Promise<void> {
    await api.put(`/admin/bulk/products/update-category?categoryId=${categoryId}`, productIds);
  },
};
