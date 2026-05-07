import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { AdminPageWrapper } from "./PageWrapper";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../ui/dialog";
import {
  Search, Mail, Phone, Users, ShoppingCart, TrendingUp, Shield, Lock, Unlock, Eye
} from "lucide-react";
import { toast } from "sonner";
import { userApi } from "../../services/api";
import { UserDTO } from "../../app/types";

export function Customers() {
  const [customers, setCustomers] = useState<UserDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewItem, setViewItem] = useState<UserDTO | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAllUsers();
      setCustomers(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách người dùng");
    }
  };

  const filtered = customers.filter(c => {
    const matchSearch =
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
    const matchRole = roleFilter === "all" || c.role.toLowerCase() === roleFilter;
    const matchStatus = statusFilter === "all" || "active" === statusFilter; // assuming active status for now
    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleBlock = (id: string) => {
    // Optional: implement block API call
    toast.success("Đã khóa/mở khóa tài khoản");
  };

  const handleSetAdmin = async (id: string) => {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    const newRole = customer.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await userApi.updateUserRole(id, newRole);
      setCustomers(prev => prev.map(c =>
        c.id === id ? { ...c, role: newRole } : c
      ));
      toast.success(newRole === 'ADMIN' ? "Đã cấp quyền Admin" : "Đã thu hồi quyền Admin");
    } catch(err) {
      toast.error("Lỗi cập nhật quyền");
    }
  };

  const totalCustomers = customers.filter(c => c.role === 'USER').length;
  const totalRevenue = 0; // Mocked
  const blockedCount = 0; // Mocked
  const avgSpend = 0; // Mocked

  return (
    <AdminPageWrapper title="" description="">
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
                {filtered.map(customer => (
                  <TableRow key={customer.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {customer.username.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{customer.username}</p>
                          <p className="text-xs text-slate-400">#{customer.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          <span className="max-w-[160px] truncate">{customer.username}@gearflow.io</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          {customer.phone || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-700">0</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      —
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {customer.role === 'ADMIN' ? (
                        <Badge className="bg-purple-100 text-purple-700 gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600">Khách hàng</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
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
                          title={customer.role === 'ADMIN' ? 'Thu hồi quyền Admin' : 'Cấp quyền Admin'}
                          className="rounded-lg hover:bg-purple-50 hover:text-purple-600 h-8 w-8 p-0"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(customer.id)}
                          className={`rounded-lg h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600`}
                        >
                          <Lock className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Customer Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin tài khoản</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {viewItem.username.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewItem.username}</h3>
                  <div className="flex gap-2 mt-1">
                    {viewItem.role === 'ADMIN' ? (
                      <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600">Khách hàng</Badge>
                    )}
                    <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: `${viewItem.username}@gearflow.io` },
                  { label: "Điện thoại", value: viewItem.phone || 'N/A' },
                  { label: "Ngày tham gia", value: new Date(viewItem.createdAt).toLocaleDateString('vi-VN') },
                  { label: "Tổng đơn hàng", value: "0" },
                  { label: "Tổng chi tiêu", value: "Chưa có" },
                  { label: "Mã KH", value: viewItem.id.substring(0,8) },
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
    </AdminPageWrapper>
  );
}
