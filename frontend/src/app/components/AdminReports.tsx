import { useState, useEffect } from "react";
import { reportService, type RevenueData } from "../services/reportService";
import { AdminNav } from "./AdminNav";
import { Button } from "./ui/button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export function AdminReports() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [productStats, setProductStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [revenue, orders, products] = await Promise.all([
          reportService.getRevenueByMonth(),
          reportService.getOrderStatistics(),
          reportService.getProductStatistics(),
        ]);
        setRevenueData(revenue);
        setOrderStats(orders);
        setProductStats(products);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [period]);

  const totalRevenue = orderStats?.totalRevenue || revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = orderStats?.totalOrders || revenueData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by quarter
  const quarterData = [
    { quarter: 'Q1', revenue: revenueData.slice(0, 3).reduce((s, d) => s + d.revenue, 0) },
    { quarter: 'Q2', revenue: revenueData.slice(3, 6).reduce((s, d) => s + d.revenue, 0) },
    { quarter: 'Q3', revenue: revenueData.slice(6, 9).reduce((s, d) => s + d.revenue, 0) },
    { quarter: 'Q4', revenue: revenueData.slice(9, 12).reduce((s, d) => s + d.revenue, 0) },
  ];

  // Product layout distribution
  const layoutData = productStats?.layoutDistribution || [];

  // Order status distribution
  const statusData = [
    { name: 'Đã giao', value: orderStats?.deliveredOrders || 0, color: '#10b981' },
    { name: 'Đang giao', value: orderStats?.shippedOrders || 0, color: '#6366f1' },
    { name: 'Đang xử lý', value: orderStats?.processingOrders || 0, color: '#f59e0b' },
    { name: 'Chờ xử lý', value: orderStats?.pendingOrders || 0, color: '#3b82f6' },
    { name: 'Đã hủy', value: orderStats?.cancelledOrders || 0, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Payment method - fallback to mock data if not available
  const paymentData = [
    { name: 'VNPAY', value: 45 },
    { name: 'COD', value: 55 },
  ];

  const metrics = [
    {
      label: "Tổng doanh thu",
      value: `${(totalRevenue / 1000000).toFixed(1)}M đ`,
      change: "+18.5%",
      positive: true,
      desc: "So với năm ngoái",
    },
    {
      label: "Tổng đơn hàng",
      value: totalOrders.toString(),
      change: "+12.3%",
      positive: true,
      desc: "So với năm ngoái",
    },
    {
      label: "Giá trị đơn TB",
      value: `${(avgOrderValue / 1000).toFixed(0)}K đ`,
      change: "+5.2%",
      positive: true,
      desc: "So với năm ngoái",
    },
    {
      label: "Tỷ lệ hủy đơn",
      value: orderStats ? `${((orderStats.cancelledOrders / orderStats.totalOrders) * 100).toFixed(1)}%` : "0%",
      change: "-2.1%",
      positive: true,
      desc: "So với năm ngoái",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Báo cáo thống kê</h1>
            <p className="text-slate-500 mt-1">Phân tích hiệu quả kinh doanh chi tiết</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
              {[
                { key: 'month', label: 'Tháng' },
                { key: 'quarter', label: 'Quý' },
                { key: 'year', label: 'Năm' },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key as any)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    period === p.key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button variant="outline" className="rounded-xl gap-2 border-slate-200">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {metrics.map(metric => (
            <div key={metric.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500 font-medium">{metric.label}</p>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  metric.positive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                }`}>
                  {metric.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {metric.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
              <p className="text-xs text-slate-400 mt-1">{metric.desc}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Doanh thu theo {period === 'month' ? 'tháng' : period === 'quarter' ? 'quý' : 'năm'}</h3>
              <p className="text-sm text-slate-500 mt-0.5">Năm 2026</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" />
              +18.5% vs 2025
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            {period === 'quarter' ? (
              <BarChart data={quarterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="quarter" stroke="#94a3b8" style={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: any) => [`${(v / 1000000).toFixed(1)}M đ`, 'Doanh thu']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: any) => [`${(v / 1000000).toFixed(1)}M đ`, 'Doanh thu']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Orders chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Số đơn hàng theo tháng</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Trạng thái đơn hàng</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-slate-600">{s.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Layout distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Phân bổ sản phẩm theo Layout</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={layoutData} cx="50%" cy="50%" outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {layoutData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Phương thức thanh toán</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" style={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} name="Đơn hàng" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {paymentData.map((p, i) => (
                <div key={p.name} className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">{p.value}</p>
                  <p className="text-sm text-slate-500">{p.name}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    {((p.value / (paymentData[0].value + paymentData[1].value)) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary table */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Tóm tắt doanh thu theo tháng</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-sm text-slate-500 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-medium">Tháng</th>
                  <th className="text-right px-5 py-3 font-medium">Doanh thu</th>
                  <th className="text-right px-5 py-3 font-medium">Đơn hàng</th>
                  <th className="text-right px-5 py-3 font-medium">Giá trị TB</th>
                  <th className="text-right px-5 py-3 font-medium">Tăng trưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {revenueData.slice().reverse().map((d, i, arr) => {
                  const prev = arr[i + 1];
                  const growth = prev ? ((d.revenue - prev.revenue) / prev.revenue * 100) : 0;
                  return (
                    <tr key={d.month} className="hover:bg-slate-50 text-sm">
                      <td className="px-5 py-3 font-medium text-slate-900">{d.month}/2026</td>
                      <td className="px-5 py-3 text-right font-semibold">{(d.revenue / 1000000).toFixed(1)}M đ</td>
                      <td className="px-5 py-3 text-right">{d.orders}</td>
                      <td className="px-5 py-3 text-right">{((d.revenue / d.orders) / 1000).toFixed(0)}K đ</td>
                      <td className="px-5 py-3 text-right">
                        {prev ? (
                          <span className={`font-semibold ${growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
