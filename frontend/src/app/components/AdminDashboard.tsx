import { useState, useEffect } from "react";
import { Link } from "react-router";
import { adminService, type DashboardStats, type TopProduct, type TopBrand } from "../services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AdminNav } from "./AdminNav";
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users,
  AlertTriangle,
  Tag,
  Award,
  MessageSquare,
  BarChart2,
  RefreshCw,
  Trophy,
} from "lucide-react";
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
  Legend
} from "recharts";
import { toast } from "sonner";

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topBrands, setTopBrands] = useState<TopBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, productsData, brandsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getTopProducts(5),
        adminService.getTopBrands(3),
      ]);
      setStats(statsData);
      setTopProducts(productsData);
      setTopBrands(brandsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Không thể tải dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboard();
      toast.success('Đã làm mới dữ liệu');
    } catch (error) {
      toast.error('Không thể làm mới');
    } finally {
      setRefreshing(false);
    }
  };

  const statsCards = [
    {
      title: 'Doanh thu',
      value: stats ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` : '0',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      trend: '+12.5%',
    },
    {
      title: 'Đơn hàng',
      value: stats?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
      trend: '+8.2%',
    },
    {
      title: 'Sản phẩm',
      value: stats?.totalProducts?.toString() || '0',
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Khách hàng',
      value: stats?.totalUsers?.toString() || '0',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      trend: '+23.1%',
    },
  ];

  // Mock revenue data for chart (will be replaced with real API later)
  const mockRevenueData = [
    { month: 'T1', revenue: 4200000 },
    { month: 'T2', revenue: 5100000 },
    { month: 'T3', revenue: 4800000 },
    { month: 'T4', revenue: 6200000 },
    { month: 'T5', revenue: 7500000 },
    { month: 'T6', revenue: 6800000 },
  ];

  // Format top products for chart
  const topProductsChart = topProducts.map(p => ({
    name: p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName,
    sold: p.totalSold,
    revenue: p.totalRevenue,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Tổng quan hoạt động kinh doanh</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={refreshing}
            className="rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                {stat.trend && (
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {stat.trend}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-bold mb-2 text-slate-900">{stat.value}</h3>
              <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Pending Orders Alert */}
        {stats && stats.pendingOrders && stats.pendingOrders > 0 && (
          <div className="mb-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-orange-200 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-900">
                    Đơn hàng chờ xử lý
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    {stats.pendingOrders} đơn hàng cần xử lý
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Link to="/admin/orders">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 rounded-lg">
                  Xem đơn hàng chờ xử lý
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Doanh thu theo tháng</h3>
              <p className="text-sm text-slate-600 mt-1">
                Tổng doanh thu: <span className="font-semibold text-slate-900">{stats ? (stats.totalRevenue / 1000000).toFixed(1) : '0'}M VNĐ</span>
              </p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value: any) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Sản phẩm bán chạy</h3>
              <p className="text-sm text-slate-600 mt-1">Top {topProducts.length} sản phẩm bán chạy nhất</p>
            </div>
            <div className="p-6">
              {topProductsChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProductsChart} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tickFormatter={(value) => `${value}`} stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === 'sold') return [value, 'Đã bán'];
                        return [`${(value / 1000000).toFixed(1)}M`, 'Doanh thu'];
                      }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Bar dataKey="sold" fill="#6366f1" name="Đã bán" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Chưa có dữ liệu sản phẩm bán chạy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top 3 Products & Brands */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top 3 Products */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Top 3 Sản phẩm bán chạy</h3>
                <p className="text-xs text-slate-500">Dựa trên đơn hàng đã giao</p>
              </div>
            </div>
            <div className="p-6">
              {topProducts.slice(0, 3).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.slice(0, 3).map((product, index) => (
                    <div key={product.productId} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-slate-100 text-slate-600' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        #{index + 1}
                      </div>
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.productName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {product.productName || product.productId}
                        </p>
                        <p className="text-xs text-slate-500">
                          Đã bán: <span className="font-semibold text-indigo-600">{product.totalSold}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900">
                          {((product.totalRevenue || 0) / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-slate-400">doanh thu</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Brands */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Top 3 Thương hiệu bán chạy</h3>
                <p className="text-xs text-slate-500">Dựa trên đơn hàng đã giao</p>
              </div>
            </div>
            <div className="p-6">
              {topBrands.slice(0, 3).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Award className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topBrands.slice(0, 3).map((brand, index) => (
                    <div key={brand.brandId} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-slate-100 text-slate-600' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-600">
                          {(brand.brandName || brand.brandId).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {brand.brandName || brand.brandId}
                        </p>
                        <p className="text-xs text-slate-500">
                          Đã bán: <span className="font-semibold text-amber-600">{brand.totalSold}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900">
                          {((brand.totalRevenue || 0) / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-slate-400">doanh thu</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">Quản lý nhanh</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { to: "/admin/reports", icon: BarChart2, label: "Báo cáo", color: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200" },
                { to: "/admin/products", icon: Package, label: "Sản phẩm", color: "bg-blue-100 text-blue-600 group-hover:bg-blue-200" },
                { to: "/admin/inventory", icon: Package, label: "Tồn kho", color: "bg-purple-100 text-purple-600 group-hover:bg-purple-200" },
                { to: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng", color: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200" },
                { to: "/admin/customers", icon: Users, label: "Tài khoản", color: "bg-orange-100 text-orange-600 group-hover:bg-orange-200" },
                { to: "/admin/categories", icon: Tag, label: "Danh mục", color: "bg-pink-100 text-pink-600 group-hover:bg-pink-200" },
                { to: "/admin/brands", icon: Award, label: "Thương hiệu", color: "bg-amber-100 text-amber-600 group-hover:bg-amber-200" },
                { to: "/admin/reviews", icon: MessageSquare, label: "Đánh giá", color: "bg-teal-100 text-teal-600 group-hover:bg-teal-200" },
              ].map(item => (
                <Link key={item.to} to={item.to}>
                  <div className="group border-2 border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-700 text-xs group-hover:text-slate-900 text-center">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
