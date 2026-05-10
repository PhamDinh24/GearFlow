import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { orderApi, productApi, userApi, adminApi } from '../../services/api';
import { exportService, type ReportData } from '../../services/exportService';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  generateBarChartImage,
  generatePieChartImage
} from '../../utils/exportUtils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from 'sonner';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  revenueByDate: Array<{ date: string; revenue: number; month: string }>;
  topProducts: Array<{ id: string; name: string; sold: number; soldCount: number; revenue: number }>;
  ordersByStatus: Array<{ name: string; value: number; color: string }>;
  ordersByMonth: Array<{ month: string; orders: number }>;
  paymentMethods: Array<{ name: string; value: number; color: string }>;
  revenueGrowth: number;
  ordersGrowth: number;
}

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
};

const STATUS_COLORS: Record<string, string> = {
  'Đã giao': COLORS.success,
  'Đang giao': COLORS.info,
  'Đang xử lý': COLORS.warning,
  'Chờ xử lý': COLORS.purple,
};

function DashboardNew() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueByDate: [],
    topProducts: [],
    ordersByStatus: [],
    ordersByMonth: [],
    paymentMethods: [],
    revenueGrowth: 0,
    ordersGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState<'day' | 'month' | 'quarter'>('month');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [reportPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [orders, productsRes, users, backendStats] = await Promise.all([
        adminApi.getAllOrders(),
        productApi.getProducts(0, 1000),
        userApi.getAllUsers(),
        adminApi.getDashboardStats()
      ]);

      const products = Array.isArray(productsRes) ? productsRes : (productsRes?.content || []);

      // Calculate revenue
      const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
      const totalRevenue = backendStats.totalRevenue || deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Revenue by date (last 12 months)
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      const revenueByDate = last12Months.map(date => {
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthOrders = orders.filter(order => 
          order.status === 'DELIVERED' && order.createdAt && order.createdAt.startsWith(monthStr)
        );
        const revenue = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
        return { date: monthName, revenue, month: monthName };
      });

      // Orders by month
      const ordersByMonth = last12Months.map(date => {
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthOrders = orders.filter(order => order.createdAt && order.createdAt.startsWith(monthStr));
        const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
        return { month: monthName, orders: monthOrders.length };
      });

      // Top products
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
          sold: data.count,
          soldCount: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 5);

      // Orders by status
      const statusMap: Record<string, string> = {
        'PENDING': 'Chờ xử lý',
        'PROCESSING': 'Đang xử lý',
        'SHIPPED': 'Đang giao',
        'DELIVERED': 'Đã giao',
        'CANCELLED': 'Đã hủy',
      };

      const ordersByStatus = Object.entries(
        orders.reduce((acc, order) => {
          const status = statusMap[order.status] || order.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || COLORS.primary
      }));

      // Payment methods
      let vnpayCount = 0;
      let codCount = 0;
      orders.forEach(order => {
        if (order.paymentMethod === 'VNPAY') {
           vnpayCount++;
        } else {
           codCount++;
        }
      });

      const paymentMethods = [
        { name: 'VNPAY', value: vnpayCount, color: COLORS.primary },
        { name: 'COD', value: codCount, color: COLORS.warning },
      ];

      // Calculate growth
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth - 1;
      const currentMonthRevenue = revenueByDate[currentMonth]?.revenue || 0;
      const lastMonthRevenue = revenueByDate[lastMonth]?.revenue || 1;
      const revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

      const currentMonthOrders = ordersByMonth[currentMonth]?.orders || 0;
      const lastMonthOrders = ordersByMonth[lastMonth]?.orders || 1;
      const ordersGrowth = ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;

      setStats({
        totalOrders: backendStats.totalOrders || orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: backendStats.totalUsers || users.length,
        revenueByDate,
        topProducts,
        ordersByStatus,
        ordersByMonth,
        paymentMethods,
        revenueGrowth,
        ordersGrowth,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'word') => {
    try {
      setExporting(true);
      
      const reportData: ReportData = {
        title: 'Báo cáo kinh doanh',
        period: getPeriodLabel(),
        stats: {
          totalRevenue: stats.totalRevenue,
          totalOrders: stats.totalOrders,
          totalProducts: stats.totalProducts,
          totalCustomers: stats.totalUsers,
        },
        revenueByDate: stats.revenueByDate,
        topProducts: stats.topProducts,
        ordersByStatus: stats.ordersByStatus.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {} as Record<string, number>),
        paymentMethods: stats.paymentMethods.reduce((acc, item) => {
          acc[item.name] = item.value;
          return acc;
        }, {} as Record<string, number>),
        charts: {
          revenueChart: generateBarChartImage(
            "Biểu đồ doanh thu",
            stats.revenueByDate.map(d => d.date),
            stats.revenueByDate.map(d => d.revenue),
            [COLORS.primary]
          ),
          statusChart: generatePieChartImage(
            "Trạng thái đơn hàng",
            stats.ordersByStatus.map(s => s.name),
            stats.ordersByStatus.map(s => s.value),
            stats.ordersByStatus.map(s => s.color)
          ),
          paymentChart: generateBarChartImage(
            "Phương thức thanh toán",
            stats.paymentMethods.map(p => p.name),
            stats.paymentMethods.map(p => p.value),
            stats.paymentMethods.map(p => p.color)
          )
        }
      };

      switch (format) {
        case 'excel':
          exportService.exportToExcel(reportData);
          toast.success('Đã xuất báo cáo Excel');
          break;
        case 'pdf':
          exportService.exportToPDF(reportData);
          toast.success('Đã xuất báo cáo PDF');
          break;
        case 'word':
          await exportService.exportToWord(reportData);
          toast.success('Đã xuất báo cáo Word');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Không thể xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  const getPeriodLabel = () => {
    const now = new Date();
    switch (reportPeriod) {
      case 'day':
        return now.toLocaleDateString('vi-VN');
      case 'month':
        return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Quý ${quarter}/${now.getFullYear()}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M đ`,
      change: stats.revenueGrowth,
      subtitle: 'So với tháng trước',
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders.toString(),
      change: stats.ordersGrowth,
      subtitle: 'So với tháng trước',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Giá trị đơn TB',
      value: `${((stats.totalRevenue / stats.totalOrders) / 1000).toFixed(0)}K đ`,
      change: 3.2,
      subtitle: 'So với tháng trước',
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Tỷ lệ hủy đơn',
      value: '0.0%',
      change: -2.1,
      subtitle: 'So với tháng trước',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-3 text-slate-900">Tổng quan</h1>
            <p className="text-lg text-slate-600">Theo dõi hoạt động kinh doanh</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={reportPeriod} onValueChange={(v: any) => setReportPeriod(v)}>
              <SelectTrigger className="w-[180px] rounded-xl border-2">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Theo ngày</SelectItem>
                <SelectItem value="month">Theo tháng</SelectItem>
                <SelectItem value="quarter">Theo quý</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('excel')}
                disabled={exporting}
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="bg-red-600 hover:bg-red-700 rounded-xl"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => handleExport('word')}
                disabled={exporting}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Word
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-2 border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} shadow-md`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-1 text-slate-900">{stat.value}</h3>
                <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Revenue Chart */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="border-b-2 border-slate-200 bg-slate-50">
              <CardTitle className="text-xl">Doanh thu theo tháng</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Năm 2026 • <span className="text-emerald-600 font-semibold">+18.5% vs 2025</span></p>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.revenueByDate}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value: any) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                    contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders by Status */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="border-b-2 border-slate-200 bg-slate-50">
              <CardTitle className="text-xl">Trạng thái đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Orders by Month */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="border-b-2 border-slate-200 bg-slate-50">
              <CardTitle className="text-xl">Số đơn hàng theo tháng</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.ordersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                  <Bar dataKey="orders" fill={COLORS.purple} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="border-b-2 border-slate-200 bg-slate-50">
              <CardTitle className="text-xl">Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.paymentMethods} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {stats.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


export { DashboardNew as Dashboard };
