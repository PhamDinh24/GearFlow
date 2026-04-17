import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminPageWrapper } from './PageWrapper';
import { orderApi, productApi, userApi, brandApi, categoryApi, adminApi } from '../../services/api';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCcw
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
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [orders, products, users, brands, categoriesRes, backendStats] = await Promise.all([
        adminApi.getAllOrders(),
        productApi.getProducts(0, 1000).then(res => Array.isArray(res) ? res : (res?.content || [])),
        userApi.getAllUsers(),
        brandApi.getBrands(),
        categoryApi.getCategories(),
        adminApi.getDashboardStats()
      ]);

      const categories = Array.isArray(categoriesRes) ? categoriesRes : [];

      console.log('Dashboard loaded:', { 
        orders: orders.length, 
        products: products.length, 
        users: users.length,
        brands: brands.length,
        categories: categories.length,
        backendStats
      });

      // Calculate stats
      const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
      const totalRevenue = backendStats.totalRevenue || deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
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
        const dayDeliveredOrders = orders.filter(order => 
          order.status === 'DELIVERED' && order.createdAt && order.createdAt.startsWith(date)
        );
        const revenue = dayDeliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
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
                name: product?.name || productId,
                imageUrl: product?.imageUrl || ''
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
          imageUrl: data.imageUrl,
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
        totalOrders: backendStats.totalOrders || orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: backendStats.totalUsers || users.length,
        recentOrders: orders.slice(0, 5).map(o => {
          const firstItem = o.items && o.items[0];
          const product = products.find(p => p.id === firstItem?.productId);
          return {
            ...o,
            userName: users.find((u: any) => u.id === o.userId)?.username || users.find((u: any) => u.id === o.userId)?.email || o.userId.substring(0, 8) + '...',
            thumbnail: product?.imageUrl || ''
          };
        }),
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

  const exportByTimeRange = () => {
    const filteredOrders = stats.recentOrders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });

    const timeRangeRevenue = stats.revenueByDate.filter(item => {
      return item.fullDate && item.fullDate >= startDate && item.fullDate <= endDate;
    });

    const totalRevenueInRange = timeRangeRevenue.reduce((sum, item) => sum + item.revenue, 0);

    const csvData = [
      [`Báo Cáo Từ ${startDate} Đến ${endDate}`],
      [''],
      ['Tổng Quan'],
      ['Tổng Đơn Hàng', filteredOrders.length],
      ['Tổng Doanh Thu', totalRevenueInRange],
      [''],
      ['Doanh Thu Theo Ngày'],
      ['Ngày', 'Doanh Thu'],
      ...timeRangeRevenue.map(item => [item.date, item.revenue]),
      [''],
      ['Đơn Hàng'],
      ['Mã Đơn', 'Khách Hàng', 'Tổng Tiền', 'Trạng Thái', 'Ngày Đặt'],
      ...filteredOrders.map(order => [
        order.id.substring(0, 8),
        order.userId.substring(0, 8),
        order.totalAmount,
        order.status,
        new Date(order.createdAt).toLocaleDateString('vi-VN')
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-report-${startDate}-to-${endDate}.csv`;
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
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 border-none shadow-sm overflow-hidden group">
      <CardContent className="p-6 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
        <div className="flex items-center justify-between relative z-10">
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
    <AdminPageWrapper
      title="Dashboard"
      description="Xem tổng quan toàn bộ dữ liệu kinh doanh"
      actions={(
        <>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <label className="text-sm font-medium">Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
          <Button onClick={exportByTimeRange} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Xuất Theo Thời Gian
          </Button>
          <Button onClick={exportToJSON} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Xuất JSON
          </Button>
        </>
      )}
    >
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
                <div key={product.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {index + 1}
                      </div>
                      <img 
                        src={product.imageUrl || 'https://via.placeholder.com/40'} 
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm z-20"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        Doanh thu: {product.revenue.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{product.soldCount}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Đã bán</p>
                  </div>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Brands */}
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
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              Top 3 Danh Mục
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

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

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn Hàng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Đơn Hàng</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Khách Hàng</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Tổng Tiền</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Trạng Thái</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Ngày Đặt</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-white transition-all duration-200 group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-blue-200 transition-colors">
                          <img 
                            src={order.thumbnail || 'https://via.placeholder.com/40'} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-gray-400">#{order.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{order.userName || order.userId}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[150px]">ID: {order.userId.substring(0, 8)}...</div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{order.totalAmount?.toLocaleString('vi-VN')}đ</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                        order.status === 'PROCESSING' ? 'bg-purple-50 text-purple-700' :
                        order.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' :
                        order.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700' :
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
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
