import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminPageWrapper } from './PageWrapper';
import { HelpTooltip } from '../common/HelpTooltip';
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
  'Đang chờ xác nhận': '#94a3b8', // Slate-400
  'Đã xác nhận': '#3b82f6',       // Blue-500
  'Đang chuẩn bị hàng': '#f59e0b', // Amber-500
  'Đang giao hàng': '#6366f1',     // Indigo-500
  'Đã giao thành công': '#10b981', // Emerald-500
  'Đã hủy': '#ef4444',             // Red-500
  'Yêu cầu trả hàng': '#f97316',    // Orange-500
  'Đã xác nhận yêu cầu': '#06b6d4', // Cyan-500
  'Đang kiểm tra sản phẩm': '#8b5cf6', // Violet-500
  'Trả hàng thành công': '#ec4899', // Pink-500
  'Từ chối trả hàng': '#475569',    // Slate-600
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
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter'>('week');
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
      
      // Dynamic period calculation for charts
      let chartDataPoints = 0;
      let getPeriodStr = (date: Date) => "";
      let getLabel = (date: Date) => "";
      
      switch (reportPeriod) {
        case 'week':
          chartDataPoints = 7;
          getPeriodStr = (d) => d.toISOString().split('T')[0];
          getLabel = (d) => d.toLocaleDateString('vi-VN', { weekday: 'short' });
          break;
        case 'month':
          chartDataPoints = 12;
          getPeriodStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          getLabel = (d) => d.toLocaleDateString('vi-VN', { month: 'short' });
          break;
        case 'quarter':
          chartDataPoints = 4;
          getPeriodStr = (d) => {
            const q = Math.floor(d.getMonth() / 3) + 1;
            return `${d.getFullYear()}-Q${q}`;
          };
          getLabel = (d) => `Q${Math.floor(d.getMonth() / 3) + 1}`;
          break;
      }

      const periodDates = Array.from({ length: chartDataPoints }, (_, i) => {
        const date = new Date();
        if (reportPeriod === 'week') date.setDate(date.getDate() - i);
        else if (reportPeriod === 'month') date.setMonth(date.getMonth() - i);
        else if (reportPeriod === 'quarter') date.setMonth(date.getMonth() - (i * 3));
        return date;
      }).reverse();

      const revenueByDate = periodDates.map(date => {
        const periodOrders = orders.filter(order => {
          if (!order.createdAt || order.status !== 'DELIVERED') return false;
          const orderDate = new Date(order.createdAt);
          
          if (reportPeriod === 'week') {
            return orderDate.toDateString() === date.toDateString();
          } else if (reportPeriod === 'month') {
            return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
          } else if (reportPeriod === 'quarter') {
            const orderQ = Math.floor(orderDate.getMonth() / 3);
            const targetQ = Math.floor(date.getMonth() / 3);
            return orderQ === targetQ && orderDate.getFullYear() === date.getFullYear();
          }
          return false;
        });
        
        const revenue = periodOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        return { date: getLabel(date), revenue, month: getLabel(date) };
      });

      // Orders trend
      const ordersByMonth = periodDates.map(date => {
        const periodOrders = orders.filter(order => {
          if (!order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          
          if (reportPeriod === 'week') {
            return orderDate.toDateString() === date.toDateString();
          } else if (reportPeriod === 'month') {
            return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
          } else if (reportPeriod === 'quarter') {
            const orderQ = Math.floor(orderDate.getMonth() / 3);
            const targetQ = Math.floor(date.getMonth() / 3);
            return orderQ === targetQ && orderDate.getFullYear() === date.getFullYear();
          }
          return false;
        });
        return { month: getLabel(date), orders: periodOrders.length };
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
        'PENDING': 'Đang chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'PROCESSING': 'Đang chuẩn bị hàng',
        'SHIPPED': 'Đang giao hàng',
        'DELIVERED': 'Đã giao thành công',
        'CANCELLED': 'Đã hủy',
        'RETURN_REQUESTED': 'Yêu cầu trả hàng',
        'RETURN_CONFIRMED': 'Đã xác nhận yêu cầu',
        'RETURN_INSPECTING': 'Đang kiểm tra sản phẩm',
        'RETURNED': 'Trả hàng thành công',
        'RETURN_REJECTED': 'Từ chối trả hàng',
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
      case 'week':
        const start = new Date();
        start.setDate(now.getDate() - 7);
        return `${start.toLocaleDateString('vi-VN')} - ${now.toLocaleDateString('vi-VN')}`;
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
    <AdminPageWrapper
      title="Tổng quan"
      description="Theo dõi hoạt động kinh doanh"
      helpContent="Trung tâm điều khiển và theo dõi hoạt động kinh doanh của GearFlow:
        • Chỉ số quan trọng: Theo dõi nhanh Doanh thu, Đơn hàng và Tăng trưởng so với tháng trước.
        • Biểu đồ doanh thu: Trực quan hóa doanh số theo Tuần, Tháng hoặc Quý.
        • Trạng thái đơn: Giám sát tỷ lệ đơn hàng đang xử lý, đã giao hoặc bị hủy.
        • Xuất báo cáo: Tải dữ liệu thống kê dưới dạng Excel, PDF hoặc Word để lưu trữ."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Select value={reportPeriod} onValueChange={(v: any) => setReportPeriod(v)}>
            <SelectTrigger className="w-[180px] rounded-xl border-2 h-11">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Theo tuần</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="quarter">Theo quý</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('excel')}
              disabled={exporting}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11"
              size="sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="bg-red-600 hover:bg-red-700 rounded-xl h-11"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => handleExport('word')}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Word
            </Button>
          </div>
        </div>
      }
    >
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
              <CardTitle className="text-xl">Biểu đồ doanh thu ({getPeriodLabel()})</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Xu hướng tăng trưởng dựa trên dữ liệu hiện tại</p>
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
              <CardTitle className="text-xl">Xu hướng số lượng đơn hàng</CardTitle>
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
    </AdminPageWrapper>
  );
}


export { DashboardNew as Dashboard };
