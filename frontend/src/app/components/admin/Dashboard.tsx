import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AdminPageWrapper } from './PageWrapper';
import { orderApi, productApi, userApi, brandApi, categoryApi, adminApi } from '../../services/api';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users,
  AlertTriangle,
  Eye,
  Tag,
  Award,
  MessageSquare,
  BarChart2
} from 'lucide-react';
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
} from 'recharts';
import { Link } from 'react-router';
import { toast } from 'sonner';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  ordersByStatus: Record<string, number>;
  revenueByDate: Array<{ date: string; revenue: number; fullDate?: string }>;
  topProducts: Array<{ id: string; name: string; soldCount: number; revenue: number; imageUrl?: string }>;
  lowStockProducts: Array<{ id: string; name: string; stock: number; image?: string }>;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    ordersByStatus: {},
    revenueByDate: [],
    topProducts: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

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

      // Calculate stats
      const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
      const totalRevenue = backendStats.totalRevenue || deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
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
        const formattedDate = new Date(date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
        return { date: formattedDate, revenue, fullDate: date, month: formattedDate };
      });

      const productSales: Record<string, { count: number; revenue: number; name: string; imageUrl?: string }> = {};
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
          sold: data.count,
          soldCount: data.count,
          revenue: data.revenue,
          imageUrl: data.imageUrl
        }))
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 5);

      const lowStockProducts = products
        .filter(p => {
          const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || v.availableStock || 0), 0) || 0;
          return totalStock > 0 && totalStock <= 10;
        })
        .map(p => ({
          id: p.id,
          name: p.name,
          stock: p.variants?.reduce((sum: number, v: any) => sum + (v.stock || v.availableStock || 0), 0) || 0,
          image: p.imageUrl
        }))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      setStats({
        totalOrders: backendStats.totalOrders || orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: backendStats.totalUsers || users.length,
        recentOrders: [],
        ordersByStatus: {},
        revenueByDate,
        topProducts,
        lowStockProducts
      });
    } catch (error) {
      toast.error('Giao thức truy xuất dữ liệu thất bại');
    } finally {
      setLoading(false);
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
      title: 'Doanh thu',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Đơn hàng',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Tổng sản phẩm',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Khách hàng',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 text-slate-900">Tổng quan quản trị</h1>
          <p className="text-lg text-slate-600">Theo dõi hoạt động kinh doanh và quản lý hệ thống</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.color} shadow-lg`}>
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2 text-slate-900">{stat.value}</h3>
              <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockProducts.length > 0 && (
          <div className="mb-10 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-orange-200 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-900">
                    Cảnh báo tồn kho thấp
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    {stats.lowStockProducts.length} sản phẩm cần nhập thêm hàng
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-600">
                          Còn lại: <span className="text-orange-600 font-bold">{product.stock} sản phẩm</span>
                        </p>
                      </div>
                    </div>
                    <Link to="/admin/inventory">
                      <Button size="sm" variant="outline" className="rounded-lg border-2 hover:bg-orange-50">
                        <Eye className="w-4 h-4 mr-2" />
                        Xem
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <Link to="/admin/inventory">
                <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 rounded-xl text-white h-12 font-bold shadow-lg">
                  Xem tất cả sản phẩm tồn kho thấp
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Revenue Chart */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6 border-b-2 border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Doanh thu 7 ngày qua</h3>
              <p className="text-sm text-slate-600 mt-1">
                Tổng doanh thu: <span className="font-semibold text-indigo-600">{(stats.totalRevenue / 1000000).toFixed(1)}M VNĐ</span>
              </p>
            </div>
            <div className="p-6 bg-white">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.revenueByDate}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
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
          <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="p-6 border-b-2 border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Sản phẩm bán chạy</h3>
              <p className="text-sm text-slate-600 mt-1">Top 5 sản phẩm bán chạy nhất</p>
            </div>
            <div className="p-6 bg-white">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topProducts} layout="horizontal">
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
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg">
          <div className="p-6 border-b-2 border-slate-200 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-900">Quản lý nhanh</h3>
            <p className="text-sm text-slate-600 mt-1">Truy cập nhanh các chức năng quản trị</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { to: "/admin/products", icon: Package, label: "Sản phẩm", color: "bg-blue-100 text-blue-600 group-hover:bg-blue-200" },
                { to: "/admin/inventory", icon: Package, label: "Tồn kho", color: "bg-purple-100 text-purple-600 group-hover:bg-purple-200" },
                { to: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng", color: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200" },
                { to: "/admin/customers", icon: Users, label: "Tài khoản", color: "bg-orange-100 text-orange-600 group-hover:bg-orange-200" },
                { to: "/admin/categories", icon: Tag, label: "Danh mục", color: "bg-pink-100 text-pink-600 group-hover:bg-pink-200" },
                { to: "/admin/brands", icon: Award, label: "Thương hiệu", color: "bg-amber-100 text-amber-600 group-hover:bg-amber-200" },
              ].map(item => (
                <Link key={item.to} to={item.to}>
                  <div className="group border-2 border-slate-200 rounded-2xl h-28 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-lg transition-all cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900 text-center">{item.label}</span>
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

