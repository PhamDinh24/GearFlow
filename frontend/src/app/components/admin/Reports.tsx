import { useState, useEffect } from "react";
import { AdminNav } from "./AdminNav";
import { Button } from "../ui/button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Download, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { adminApi, productApi } from "../../services/api";
import { OrderDTO, ProductDTO } from "../../app/types";
import { toast } from "sonner";
import { 
  exportToExcelTable, 
  exportToPDF, 
  exportToWord, 
  generateFilename,
  formatCurrencyForExport,
  formatDateForExport,
  generateBarChartImage,
  generatePieChartImage
} from "../../utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export function Reports() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        adminApi.getAllOrders(),
        productApi.getProducts(0, 1000)
      ]);
      setOrders(ordersData);
      setProducts(Array.isArray(productsData) ? productsData : productsData.content || []);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'excel' | 'pdf' | 'word') => {
    try {
      const filename = generateFilename(`bao_cao_doanh_thu_${period}`);
      const title = `BÁO CÁO DOANH THU THEO ${period === 'month' ? 'THÁNG' : period === 'quarter' ? 'QUÝ' : 'NĂM'}`;
      
      const metadata = {
        "Ngày xuất": new Date().toLocaleString('vi-VN'),
        "Người xuất": "Admin",
        "Kỳ báo cáo": period === 'month' ? "Tháng / 2026" : period === 'quarter' ? "Quý / 2026" : "Năm 2026",
        "Tổng doanh thu": formatCurrencyForExport(totalRevenue)
      };

      const headers = ["Tháng", "Doanh thu", "Đơn hàng", "Giá trị TB"];
      const data = revenueByMonth.map(d => [
        d.month,
        formatCurrencyForExport(d.revenue),
        d.orders.toString(),
        formatCurrencyForExport(d.orders ? d.revenue / d.orders : 0)
      ]);

      // Generate Chart Images for PDF/Word
      const revenueChartImage = generateBarChartImage(
        "Biểu đồ doanh thu theo thời gian",
        revenueByMonth.map(d => d.month),
        revenueByMonth.map(d => d.revenue),
        ['#6366F1']
      );

      const statusChartImage = generatePieChartImage(
        "Biểu đồ trạng thái đơn hàng",
        statusData.map(s => s.name),
        statusData.map(s => s.value),
        statusData.map(s => s.color)
      );

      const extraSections: any[] = [
        {
          title: "Biểu đồ doanh thu",
          type: 'image',
          imageData: revenueChartImage
        },
        {
          title: "Biểu đồ trạng thái đơn hàng",
          type: 'image',
          imageData: statusChartImage
        }
      ];

      if (type === 'excel') {
        exportToExcelTable(title, metadata, headers, data, filename);
      } else if (type === 'pdf') {
        exportToPDF(title, headers, data, filename, metadata, extraSections);
      } else if (type === 'word') {
        await exportToWord(title, headers, data, filename, metadata, extraSections);
      }
      
      toast.success("Xuất báo cáo thành công");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xuất báo cáo");
    }
  };

  // Build revenue data by month
  const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === i && o.status === 'DELIVERED';
    });
    return {
      month: `T${month}`,
      revenue: monthOrders.reduce((s, o) => s + o.totalAmount, 0),
      orders: monthOrders.length
    };
  });

  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, d) => s + d.totalAmount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by quarter
  const quarterData = [
    { quarter: 'Q1', revenue: revenueByMonth.slice(0, 3).reduce((s, d) => s + d.revenue, 0) },
    { quarter: 'Q2', revenue: revenueByMonth.slice(3, 6).reduce((s, d) => s + d.revenue, 0) },
    { quarter: 'Q3', revenue: revenueByMonth.slice(6, 9).reduce((s, d) => s + d.revenue, 0) },
    { quarter: 'Q4', revenue: revenueByMonth.slice(9, 12).reduce((s, d) => s + d.revenue, 0) },
  ];

  // Product layout distribution (mocked since real data has no layout)
  const layoutData = ['60%', '65%', '75%', 'TKL', 'Full-size'].map(layout => ({
    name: layout,
    value: Math.floor(Math.random() * 20) + 1,
  }));

  // Order status distribution
  const statusData = [
    { name: 'Đang chờ xác nhận', value: orders.filter(o => o.status === 'PENDING').length, color: '#94a3b8' },
    { name: 'Đã xác nhận', value: orders.filter(o => o.status === 'CONFIRMED').length, color: '#3b82f6' },
    { name: 'Đang chuẩn bị hàng', value: orders.filter(o => o.status === 'PROCESSING').length, color: '#f59e0b' },
    { name: 'Đang giao hàng', value: orders.filter(o => o.status === 'SHIPPED').length, color: '#6366f1' },
    { name: 'Đã giao thành công', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#10b981' },
    { name: 'Đã hủy', value: orders.filter(o => o.status === 'CANCELLED').length, color: '#ef4444' },
    { name: 'Yêu cầu trả hàng', value: orders.filter(o => o.status === 'RETURN_REQUESTED').length, color: '#f97316' },
    { name: 'Trả hàng thành công', value: orders.filter(o => o.status === 'RETURNED').length, color: '#ec4899' },
    { name: 'Từ chối trả hàng', value: orders.filter(o => o.status === 'RETURN_REJECTED').length, color: '#475569' },
  ].filter(s => s.value > 0);

  // Payment method (mocked assuming COD for now)
  const paymentData = [
    { name: 'VNPAY', value: 0 },
    { name: 'COD', value: orders.length },
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
      value: `${orders.length ? ((orders.filter(o => o.status === 'CANCELLED').length / orders.length) * 100).toFixed(1) : 0}%`,
      change: "-2.1%",
      positive: true,
      desc: "So với năm ngoái",
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2 border-slate-200">
                  <Download className="w-4 h-4" />
                  Xuất báo cáo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Xuất file Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                  Xuất file Word (.docx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Xuất file PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <AreaChart data={revenueByMonth}>
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
              <BarChart data={revenueByMonth}>
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
                    {orders.length ? ((p.value / orders.length) * 100).toFixed(1) : 0}%
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
                {revenueByMonth.slice().reverse().map((d, i, arr) => {
                  const prev = arr[i + 1];
                  const growth = prev && prev.revenue ? ((d.revenue - prev.revenue) / prev.revenue * 100) : 0;
                  return (
                    <tr key={d.month} className="hover:bg-slate-50 text-sm">
                      <td className="px-5 py-3 font-medium text-slate-900">{d.month}/2026</td>
                      <td className="px-5 py-3 text-right font-semibold">{(d.revenue / 1000000).toFixed(1)}M đ</td>
                      <td className="px-5 py-3 text-right">{d.orders}</td>
                      <td className="px-5 py-3 text-right">{d.orders ? ((d.revenue / d.orders) / 1000).toFixed(0) : 0}K đ</td>
                      <td className="px-5 py-3 text-right">
                        {prev && prev.revenue ? (
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
