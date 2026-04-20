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
  File,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar
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
import { toast } from 'sonner';
import { 
  exportToExcel, 
  exportToPDF, 
  exportToWord,
  exportToExcelTable,
  formatDateForExport,
  formatCurrencyForExport,
  generateFilename
} from '../../utils/exportUtils';

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

      // Sort orders by createdAt (newest first) before taking recent orders
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setStats({
        totalOrders: backendStats.totalOrders || orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: backendStats.totalUsers || users.length,
        recentOrders: sortedOrders.slice(0, 5).map(o => {
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

  const exportToExcelHandler = () => {
    const metadata = {
      'Hệ thống': 'GearFlow Management System',
      'Loại báo cáo': 'Dashboard & Thống Kê',
      'Từ ngày': new Date(startDate).toLocaleDateString('vi-VN'),
      'Đến ngày': new Date(endDate).toLocaleDateString('vi-VN'),
      'Ngày xuất': new Date().toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Người xuất': 'Administrator'
    };

    const headers = ['STT', 'Chỉ Số', 'Giá Trị', 'Ghi Chú'];
    
    const data = [
      [1, 'Tổng Đơn Hàng', stats.totalOrders, `${stats.recentOrders.length} đơn gần đây`],
      [2, 'Tổng Doanh Thu', `${stats.totalRevenue.toLocaleString('vi-VN')}đ`, `${(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ`],
      [3, 'Tổng Sản Phẩm', stats.totalProducts, `${stats.lowStockProducts.length} sắp hết hàng`],
      [4, 'Tổng Khách Hàng', stats.totalUsers, 'Đã đăng ký'],
      [5, 'Đơn Chờ Xử Lý', stats.ordersByStatus['PENDING'] || 0, 'Cần xác nhận'],
      [6, 'Đơn Đang Giao', (stats.ordersByStatus['PROCESSING'] || 0) + (stats.ordersByStatus['SHIPPED'] || 0), 'Đang vận chuyển'],
      [7, 'Đơn Hoàn Thành', stats.ordersByStatus['DELIVERED'] || 0, 'Đã giao thành công'],
      [8, 'Đơn Đã Hủy', stats.ordersByStatus['CANCELLED'] || 0, 'Bị hủy bỏ']
    ];

    const result = exportToExcelTable(
      'BÁO CÁO DASHBOARD & THỐNG KÊ',
      metadata,
      headers,
      data,
      `dashboard-report-${new Date().toISOString().split('T')[0]}`
    );
    
    if (result.success) {
      toast.success('Đã xuất báo cáo Excel thành công');
    } else {
      toast.error('Lỗi khi xuất báo cáo Excel');
    }
  };

  const exportToPDFHandler = () => {
    const metadata = {
      'Hệ thống': 'GearFlow Management System',
      'Loại báo cáo': 'Dashboard & Thống Kê',
      'Từ ngày': new Date(startDate).toLocaleDateString('vi-VN'),
      'Đến ngày': new Date(endDate).toLocaleDateString('vi-VN'),
      'Ngày xuất': new Date().toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Người xuất': 'Administrator'
    };

    const headers = ['STT', 'Chỉ Số', 'Giá Trị', 'Ghi Chú'];
    const data = [
      [1, 'Tổng Đơn Hàng', String(stats.totalOrders), `${stats.recentOrders.length} đơn gần đây`],
      [2, 'Tổng Doanh Thu', `${stats.totalRevenue.toLocaleString('vi-VN')}đ`, `${(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ`],
      [3, 'Tổng Sản Phẩm', String(stats.totalProducts), `${stats.lowStockProducts.length} sắp hết hàng`],
      [4, 'Tổng Khách Hàng', String(stats.totalUsers), 'Đã đăng ký'],
      [5, 'Đơn Chờ Xử Lý', String(stats.ordersByStatus['PENDING'] || 0), 'Cần xác nhận'],
      [6, 'Đơn Đang Giao', String((stats.ordersByStatus['PROCESSING'] || 0) + (stats.ordersByStatus['SHIPPED'] || 0)), 'Đang vận chuyển'],
      [7, 'Đơn Hoàn Thành', String(stats.ordersByStatus['DELIVERED'] || 0), 'Đã giao thành công'],
      [8, 'Đơn Đã Hủy', String(stats.ordersByStatus['CANCELLED'] || 0), 'Bị hủy bỏ']
    ];

    const result = exportToPDF(
      'BÁO CÁO DASHBOARD & THỐNG KÊ',
      headers,
      data,
      `dashboard-report-${new Date().toISOString().split('T')[0]}`,
      metadata
    );
    
    if (result.success) {
      toast.success('Đã xuất báo cáo PDF thành công');
    } else {
      toast.error('Lỗi khi xuất báo cáo PDF');
    }
  };

  const exportToWordHandler = async () => {
    const metadata = {
      'Hệ thống': 'GearFlow Management System',
      'Loại báo cáo': 'Dashboard & Thống Kê',
      'Từ ngày': new Date(startDate).toLocaleDateString('vi-VN'),
      'Đến ngày': new Date(endDate).toLocaleDateString('vi-VN'),
      'Ngày xuất': new Date().toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Người xuất': 'Administrator'
    };

    const headers = ['STT', 'Chỉ Số', 'Giá Trị', 'Ghi Chú'];
    const data = [
      [1, 'Tổng Đơn Hàng', String(stats.totalOrders), `${stats.recentOrders.length} đơn gần đây`],
      [2, 'Tổng Doanh Thu', `${stats.totalRevenue.toLocaleString('vi-VN')}đ`, `${(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ`],
      [3, 'Tổng Sản Phẩm', String(stats.totalProducts), `${stats.lowStockProducts.length} sắp hết hàng`],
      [4, 'Tổng Khách Hàng', String(stats.totalUsers), 'Đã đăng ký'],
      [5, 'Đơn Chờ Xử Lý', String(stats.ordersByStatus['PENDING'] || 0), 'Cần xác nhận'],
      [6, 'Đơn Đang Giao', String((stats.ordersByStatus['PROCESSING'] || 0) + (stats.ordersByStatus['SHIPPED'] || 0)), 'Đang vận chuyển'],
      [7, 'Đơn Hoàn Thành', String(stats.ordersByStatus['DELIVERED'] || 0), 'Đã giao thành công'],
      [8, 'Đơn Đã Hủy', String(stats.ordersByStatus['CANCELLED'] || 0), 'Bị hủy bỏ']
    ];

    const result = await exportToWord(
      'BÁO CÁO DASHBOARD & THỐNG KÊ',
      headers,
      data,
      `dashboard-report-${new Date().toISOString().split('T')[0]}`,
      metadata
    );
    
    if (result.success) {
      toast.success('Đã xuất báo cáo Word thành công');
    } else {
      toast.error('Lỗi khi xuất báo cáo Word');
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue,
    subtitle,
    color = 'blue'
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: 'up' | 'down';
    trendValue?: string;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';
  }) => {
    const colorClasses = {
      blue: {
        bg: 'from-blue-500 to-blue-600',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        ring: 'ring-blue-500/20'
      },
      green: {
        bg: 'from-green-500 to-emerald-600',
        light: 'bg-green-50',
        text: 'text-green-600',
        ring: 'ring-green-500/20'
      },
      purple: {
        bg: 'from-purple-500 to-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        ring: 'ring-purple-500/20'
      },
      orange: {
        bg: 'from-orange-500 to-orange-600',
        light: 'bg-orange-50',
        text: 'text-orange-600',
        ring: 'ring-orange-500/20'
      },
      pink: {
        bg: 'from-pink-500 to-pink-600',
        light: 'bg-pink-50',
        text: 'text-pink-600',
        ring: 'ring-pink-500/20'
      },
      indigo: {
        bg: 'from-indigo-500 to-indigo-600',
        light: 'bg-indigo-50',
        text: 'text-indigo-600',
        ring: 'ring-indigo-500/20'
      }
    };

    const colors = colorClasses[color];

    return (
      <Card className={`relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ${colors.ring} ring-4`}>
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        {/* Decorative Circles */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 ${colors.light} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700`} />
        <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${colors.light} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700`} />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                {trend && trendValue && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    trend === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{trendValue}</span>
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>
              )}
            </div>
            
            <div className={`p-4 bg-gradient-to-br ${colors.bg} rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors.bg} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: trend === 'up' ? '75%' : '45%' }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-screen">Đang tải...</div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Dashboard & Báo Cáo"
      description="Tổng quan và thống kê toàn bộ dữ liệu kinh doanh"
      actions={(
        <>
          <div className="flex gap-2 items-center">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={exportToExcelHandler} variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button onClick={exportToPDFHandler} variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button onClick={exportToWordHandler} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            <File className="w-4 h-4 mr-2" />
            Xuất Word
          </Button>
        </>
      )}
    >
      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders}
          subtitle={`${stats.recentOrders.length} đơn gần đây`}
          icon={ShoppingCart}
          trend="up"
          trendValue="+12.5%"
          color="blue"
        />
        <StatCard
          title="Doanh Thu"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          subtitle={`${stats.totalRevenue.toLocaleString('vi-VN')}đ`}
          icon={DollarSign}
          trend="up"
          trendValue="+8.2%"
          color="green"
        />
        <StatCard
          title="Sản Phẩm"
          value={stats.totalProducts}
          subtitle={`${stats.lowStockProducts.length} sắp hết hàng`}
          icon={Package}
          trend="up"
          trendValue="+3"
          color="purple"
        />
        <StatCard
          title="Khách Hàng"
          value={stats.totalUsers}
          subtitle="Người dùng đã đăng ký"
          icon={Users}
          trend="up"
          trendValue="+5.1%"
          color="orange"
        />
      </div>

      {/* Charts Section - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Line Chart - Larger */}
        <Card className="lg:col-span-2 border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Doanh Thu 7 Ngày Qua</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Theo dõi xu hướng doanh thu</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">+8.2%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={stats.revenueByDate}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${(value / 1000).toFixed(0)}K VNĐ`, 'Doanh Thu']}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Doanh Thu (VNĐ)"
                  dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  fill="url(#colorRevenue)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status Pie Chart - Compact */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Trạng Thái Đơn</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">Phân bố đơn hàng</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={320}>
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
                  label={({ label, percent }) => `${label}\n${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(stats.ordersByStatus).map((_, index) => {
                    const colors = ['#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performance Section - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Products */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Top Sản Phẩm</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">Bán chạy nhất</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="p-4 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                      }`}>
                        #{index + 1}
                      </div>
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl} 
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg border-2 border-white object-cover shadow-md"
                          alt=""
                        />
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate group-hover:text-yellow-600 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">
                          💰 {product.revenue.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                    
                    {/* Sales Count */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        {product.soldCount}
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Đã bán</p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Brands */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Top Thương Hiệu</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">Được yêu thích</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.topBrands.map((brand, index) => (
                <div key={brand.id} className="p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shadow-md ${
                        index === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white' :
                        'bg-gradient-to-br from-purple-300 to-pink-300 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {brand.name}
                        </p>
                        <p className="text-xs text-gray-500">Thương hiệu</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {brand.soldCount}
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Sản phẩm</p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.topBrands.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Top Danh Mục</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">Phổ biến nhất</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.topCategories.map((category, index) => (
                <div key={category.id} className="p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shadow-md ${
                        index === 0 ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-indigo-400 to-blue-400 text-white' :
                        'bg-gradient-to-br from-indigo-300 to-blue-300 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-500">Danh mục</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        {category.soldCount}
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Sản phẩm</p>
                    </div>
                  </div>
                </div>
              ))}
              {stats.topCategories.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert - Enhanced */}
      <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
        <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg shadow-lg animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Cảnh Báo Tồn Kho</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  {stats.lowStockProducts.length} sản phẩm sắp hết hàng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-red-700">Khẩn cấp</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {stats.lowStockProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-6">
              {stats.lowStockProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="relative p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 hover:border-red-400 transition-all duration-300 group cursor-pointer hover:shadow-lg"
                >
                  {/* Stock Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${
                      product.stock <= 3 ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' :
                      product.stock <= 5 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                      'bg-gradient-to-br from-yellow-500 to-yellow-600'
                    } text-white`}>
                      {product.stock}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors pr-8">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      ID: {product.id.substring(0, 12)}...
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 h-2 bg-red-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${(product.stock / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-red-600">
                        {((product.stock / 10) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600 mb-1">Tất Cả Sản Phẩm Đủ Hàng!</p>
              <p className="text-sm text-gray-500">Không có sản phẩm nào cần nhập thêm</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders - Enhanced */}
      <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Đơn Hàng Gần Đây</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  {stats.recentOrders.length} đơn hàng mới nhất
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b">
                  <th className="text-left p-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Đơn Hàng</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Khách Hàng</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Tổng Tiền</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Trạng Thái</th>
                  <th className="text-left p-4 font-bold text-gray-700 text-sm uppercase tracking-wider">Ngày Đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-300 shadow-sm">
                            <img 
                              src={order.thumbnail || 'https://via.placeholder.com/48'} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                              alt="" 
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                            <ShoppingCart className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-gray-400 mb-0.5">
                            #{order.id.substring(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.items?.length || 0} sản phẩm
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {order.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {order.userName || 'Khách hàng'}
                          </div>
                          <div className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
                            {order.userId.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-xs text-gray-400">
                        {((order.totalAmount || 0) / 1000).toFixed(0)}K VNĐ
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          order.status === 'PROCESSING' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 border border-green-200' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {order.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stats.recentOrders.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Chưa có đơn hàng nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageWrapper>
  );
};
