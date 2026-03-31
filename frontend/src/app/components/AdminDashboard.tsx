import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { apiService } from '../services/api';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data with fallbacks
      let analytics = { totalRevenue: 0, totalOrders: 0, totalUsers: 0 };
      let orders: any[] = [];
      let products: any = { content: [] };
      
      try {
        analytics = await apiService.getAnalytics();
      } catch (e) {
        console.log('Analytics not available');
      }
      
      try {
        orders = await apiService.getOrders();
      } catch (e) {
        console.log('Orders not available');
      }
      
      try {
        products = await apiService.getProducts();
      } catch (e) {
        console.log('Products not available');
      }
      
      setStats({
        totalRevenue: analytics.totalRevenue || 0,
        totalOrders: analytics.totalOrders || orders.length || 0,
        totalProducts: products.content?.length || 0,
        totalUsers: analytics.totalUsers || 0,
        recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        lowStockProducts: products.content?.filter((p: any) => p.stock < 10) || []
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Doanh Thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Sản Phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tổng Người Dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn Hàng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Mã Đơn</th>
                    <th className="text-left py-2">Khách Hàng</th>
                    <th className="text-left py-2">Tổng Tiền</th>
                    <th className="text-left py-2">Trạng Thái</th>
                    <th className="text-left py-2">Ngày Đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-2">{order.id.substring(0, 8)}</td>
                      <td className="py-2">{order.userId}</td>
                      <td className="py-2">${order.totalAmount?.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle>Sản Phẩm Sắp Hết Hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-gray-500">Tất cả sản phẩm đều còn đủ hàng</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Tên Sản Phẩm</th>
                    <th className="text-left py-2">Tồn Kho</th>
                    <th className="text-left py-2">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map((product: any) => (
                    <tr key={product.id} className="border-b">
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">
                        <span className="text-red-600 font-semibold">{product.stock}</span>
                      </td>
                      <td className="py-2">${product.basePrice?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
