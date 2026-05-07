import { useState } from "react";
import { mockCustomers, Customer } from "../data/mockData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { AdminNav } from "./AdminNav";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import {
  Search, Mail, Phone, Users, ShoppingCart, TrendingUp, Shield, Lock, Unlock, Eye
} from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "../hooks/usePagination";
import { DataPagination } from "./ui/data-pagination";

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewItem, setViewItem] = useState<Customer | null>(null);

  const filtered = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchRole = roleFilter === "all" || c.role === roleFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedCustomers,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({
    items: filtered,
    itemsPerPage: 12,
  });

  const handleToggleBlock = (id: string) => {
    setCustomers(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'blocked' ? 'active' : 'blocked' } : c
    ));
    const customer = customers.find(c => c.id === id);
    toast.success(customer?.status === 'blocked' ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
  };

  const handleSetAdmin = (id: string) => {
    setCustomers(prev => prev.map(c =>
      c.id === id ? { ...c, role: c.role === 'admin' ? 'user' : 'admin' } : c
    ));
    const customer = customers.find(c => c.id === id);
    toast.success(customer?.role === 'admin' ? "Đã thu hồi quyền Admin" : "Đã cấp quyền Admin");
  };

  const totalCustomers = customers.filter(c => c.role === 'user').length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const blockedCount = customers.filter(c => c.status === 'blocked').length;
  const avgSpend = totalRevenue / (totalCustomers || 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Bảo trì tài khoản</h1>
          <p className="text-slate-500 mt-1">Quản lý thành viên và phân quyền tài khoản</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tổng khách hàng", value: totalCustomers, icon: Users, color: "bg-blue-100 text-blue-600" },
            { label: "Doanh thu KH", value: `${(totalRevenue / 1000000).toFixed(1)}M đ`, icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
            { label: "Chi tiêu TB", value: `${(avgSpend / 1000).toFixed(0)}K đ`, icon: ShoppingCart, color: "bg-purple-100 text-purple-600" },
            { label: "Tài khoản khóa", value: blockedCount, icon: Lock, color: "bg-red-100 text-red-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm tên, email, SĐT..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Quyền" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả quyền</SelectItem>
                <SelectItem value="user">Khách hàng</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="blocked">Bị khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Danh sách tài khoản ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Tài khoản</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-right">Chi tiêu</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Quyền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map(customer => (
                  <TableRow key={customer.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{customer.name}</p>
                          <p className="text-xs text-slate-400">#{customer.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          <span className="max-w-[160px] truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-700">{customer.totalOrders}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {customer.totalSpent > 0 ? `${(customer.totalSpent / 1000000).toFixed(1)}M đ` : '—'}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(customer.joinDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {customer.role === 'admin' ? (
                        <Badge className="bg-purple-100 text-purple-700 gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600">Khách hàng</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.status === 'active' ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Bị khóa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewItem(customer)}
                          className="rounded-lg hover:bg-slate-100 h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetAdmin(customer.id)}
                          title={customer.role === 'admin' ? 'Thu hồi quyền Admin' : 'Cấp quyền Admin'}
                          className="rounded-lg hover:bg-purple-50 hover:text-purple-600 h-8 w-8 p-0"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(customer.id)}
                          className={`rounded-lg h-8 w-8 p-0 ${customer.status === 'blocked' ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-red-50 hover:text-red-600'}`}
                        >
                          {customer.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* View Customer Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin tài khoản</DialogTitle>
            <DialogDescription>Xem chi tiết thông tin khách hàng</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {viewItem.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewItem.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {viewItem.role === 'admin' ? (
                      <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600">Khách hàng</Badge>
                    )}
                    {viewItem.status === 'active' ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Bị khóa</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: viewItem.email },
                  { label: "Điện thoại", value: viewItem.phone },
                  { label: "Ngày tham gia", value: new Date(viewItem.joinDate).toLocaleDateString('vi-VN') },
                  { label: "Tổng đơn hàng", value: String(viewItem.totalOrders) },
                  { label: "Tổng chi tiêu", value: viewItem.totalSpent > 0 ? `${(viewItem.totalSpent / 1000000).toFixed(1)}M đ` : 'Chưa có' },
                  { label: "Mã KH", value: viewItem.id },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
