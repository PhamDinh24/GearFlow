import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminPageWrapper } from './PageWrapper';
import { productApi, orderApi, userApi, brandApi, categoryApi } from '../../services/api';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  ordersByStatus: Record<string, number>;
  revenueByDate: Array<{ date: string; revenue: number; fullDate?: string }>;
  topProducts: Array<{ id: string; name: string; soldCount: number; revenue: number }>;
  topBrands: Array<{ id: string; name: string; soldCount: number }>;
  topCategories: Array<{ id: string; name: string; soldCount: number }>;
  lowStockProducts: Array<{ id: string; name: string; stock: number }>;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    ordersByStatus: {},
    revenueByDate: [],
    topProducts: [],
    topBrands: [],
    topCategories: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [ordersData, productsResponse, usersData, brandsData, categoriesData] = await Promise.all([
        orderApi.getAllOrders(),
        productApi.getProducts(0, 1000),
        userApi.getAllUsers(),
        brandApi.getBrands(),
        categoryApi.getCategories()
      ]);

      // Extract arrays from responses - handle all possible formats
      const orders = Array.isArray(ordersData) ? ordersData : [];
      
      // Handle products - API may return paginated response or array
      let products: any[] = [];
      if (Array.isArray(productsResponse)) {
        products = productsResponse;
      } else if (productsResponse && typeof productsResponse === 'object') {
        products = productsResponse.content || [];
      }
      
      const users = Array.isArray(usersData) ? usersData : [];
      const brands = Array.isArray(brandsData) ? brandsData : [];
      const categories = Array.isArray(categoriesData) ? categoriesData : [];

      console.log('Dashboard loaded:', { 
        orders: orders.length, 
        products: products.length, 
        users: users.length,
        brands: brands.length,
        categories: categories.length
      });

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Orders by status
      const ordersByStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Revenue by date (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const revenueByDate = last7Days.map(date => {
        const dayOrders = orders.filter(order => 
          order.createdAt && order.createdAt.startsWith(date)
        );
        const revenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const formattedDate = new Date(date).toLocaleDateString('vi-VN', { 
          month: 'short', 
          day: 'numeric' 
        });
        return { date: formattedDate, revenue, fullDate: date };
      });

      // Top Products (by order items)
      const productSales: Record<string, { count: number; revenue: number; name: string }> = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.productId;
            if (!productSales[productId]) {
              const product = products.find(p => p.id === productId);
              productSales[productId] = { 
                count: 0, 
                revenue: 0,
                name: product?.name || productId
              };
            }
            productSales[productId].count += item.quantity || 0;
            productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({
          id,
          name: data.name,
          soldCount: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 3);

      // Top Brands
      const brandSales: Record<string, number> = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const product = products.find(p => p.id === item.productId);
            if (product?.brandId) {
              brandSales[product.brandId] = (brandSales[product.brandId] || 0) + (item.quantity || 0);
            }
          });
        }
      });

      const topBrands = Object.entries(brandSales)
        .map(([id, count]) => ({
          id,
          name: brands.find(b => b.id === id)?.name || id,
          soldCount: count
        }))
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 3);

      // Top Categories
      const categorySales: Record<string, number> = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const product = products.find(p => p.id === item.productId);
            if (product?.categoryId) {
              categorySales[product.categoryId] = (categorySales[product.categoryId] || 0) + (item.quantity || 0);
            }
          });
        }
      });

      const topCategories = Object.entries(categorySales)
        .map(([id, count]) => ({
          id,
          name: categories.find(c => c.id === id)?.name || id,
          soldCount: count
        }))
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 3);

      // Low Stock Products
      const lowStockProducts = products
        .filter(p => {
          if (!p.variants || !Array.isArray(p.variants)) return false;
          const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0);
          return totalStock > 0 && totalStock <= 10;
        })
        .map(p => ({
          id: p.id,
          name: p.name,
          stock: p.variants?.reduce((sum, v) => sum + (v.stock || v.availableStock || 0), 0) || 0
        }))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: users.length,
        recentOrders: orders.slice(0, 5),
        ordersByStatus,
        revenueByDate,
        topProducts,
        topBrands,
        topCategories,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Thống Kê Dashboard'],
      [''],
      ['Tổng Quan'],
      ['Tổng Đơn Hàng', stats.totalOrders],
      ['Tổng Doanh Thu', stats.totalRevenue],
      ['Tổng Sản Phẩm', stats.totalProducts],
      ['Tổng Khách Hàng', stats.totalUsers],
      [''],
      ['Doanh Thu Theo Ngày'],
      ['Ngày', 'Doanh Thu'],
      ...stats.revenueByDate.map(item => [item.date, item.revenue]),
      [''],
      ['Đơn Hàng Theo Trạng Thái'],
      ['Trạng Thái', 'Số Lượng'],
      ...Object.entries(stats.ordersByStatus).map(([status, count]) => [status, count])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        totalProducts: stats.totalProducts,
        totalUsers: stats.totalUsers
      },
      revenueByDate: stats.revenueByDate,
      ordersByStatus: stats.ordersByStatus,
      recentOrders: stats.recentOrders
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-screen">Đang tải...</div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper title="Dashboard" description="Xem tổng quan toàn bộ dữ liệu kinh doanh">
      <div className="flex justify-end gap-2">
        <Button onClick={exportToCSV} variant="outline">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Xuất CSV
        </Button>
        <Button onClick={exportToJSON} variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Xuất JSON
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders}
          icon={ShoppingCart}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Doanh Thu"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Sản Phẩm"
          value={stats.totalProducts}
          icon={Package}
        />
        <StatCard
          title="Khách Hàng"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          trendValue="+5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh Thu 7 Ngày Qua</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `${(value / 1000).toFixed(0)}K`}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Doanh Thu (VNĐ)"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn Hàng Theo Trạng Thái</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.ordersByStatus).map(([status, count]) => ({
                    name: status,
                    value: count,
                    label: status === 'PENDING' ? 'Chờ xử lý' :
                           status === 'CONFIRMED' ? 'Đã xác nhận' :
                           status === 'PROCESSING' ? 'Đang xử lý' :
                           status === 'SHIPPED' ? 'Đang giao' :
                           status === 'DELIVERED' ? 'Đã giao' :
                           status === 'CANCELLED' ? 'Đã hủy' : status
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(stats.ordersByStatus).map((_, index) => {
                    const colors = ['#eab308', '#3b82f6', '#6366f1', '#a855f7', '#22c55e', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top 3 Sản Phẩm Bán Chạy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {(product.revenue / 1000).toFixed(0)}K VNĐ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{product.soldCount}</p>
                    <p className="text-xs text-gray-500">đã bán</p>
                  </div>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Brands & Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Top 3 Thương Hiệu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topBrands.map((brand, index) => (
                <div key={brand.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{index + 1}.</span>
                    <span className="font-medium text-sm">{brand.name}</span>
                  </div>
                  <span className="font-bold text-purple-600">{brand.soldCount}</span>
                </div>
              ))}
              {stats.topBrands.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">Chưa có dữ liệu</p>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                Top 3 Danh Mục
              </h4>
              <div className="space-y-3">
                {stats.topCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{index + 1}.</span>
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <span className="font-bold text-indigo-600">{category.soldCount}</span>
                  </div>
                ))}
                {stats.topCategories.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">Chưa có dữ liệu</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Sản Phẩm Sắp Hết Hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">ID: {product.id.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      product.stock <= 5 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {product.stock}
                    </p>
                    <p className="text-xs text-gray-500">còn lại</p>
                  </div>
                </div>
              ))}
              {stats.lowStockProducts.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-green-600 font-medium">✓ Tất cả sản phẩm đủ hàng</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn Hàng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Mã Đơn</th>
                  <th className="text-left p-3">Khách Hàng</th>
                  <th className="text-left p-3">Tổng Tiền</th>
                  <th className="text-left p-3">Trạng Thái</th>
                  <th className="text-left p-3">Ngày Đặt</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{order.id.substring(0, 8)}...</td>
                    <td className="p-3">{order.userId.substring(0, 8)}...</td>
                    <td className="p-3 font-semibold">{order.totalAmount?.toLocaleString('vi-VN')}đ</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminPageWrapper>
  );
};
