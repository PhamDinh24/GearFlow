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
import { userApi, adminApi } from "../../services/api";
import { UserDTO } from "../../app/types";
import { usePagination } from "../../hooks/usePagination";
import { DataPagination } from "../ui/data-pagination";

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
      const [users, stats] = await Promise.all([
        userApi.getAllUsers(),
        adminApi.getUserStats()
      ]);
      
      const usersWithStats = users.map(u => ({
        ...u,
        totalOrders: stats[u.id]?.totalOrders || 0,
        totalSpent: stats[u.id]?.totalSpent || 0,
      }));
      
      setCustomers(usersWithStats);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách người dùng");
    }
  };

  const filtered = customers.filter(c => {
    const matchSearch =
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
    const matchRole = roleFilter === "all" || c.role.toLowerCase() === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? c.active : !c.active);
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

  const handleToggleBlock = async (id: string) => {
    try {
      const updatedUser = await userApi.toggleUserStatus(id);
      setCustomers(prev => prev.map(c =>
        c.id === id ? { ...c, active: updatedUser.active } : c
      ));
      toast.success(updatedUser.active ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái tài khoản");
    }
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

  const totalAccounts = customers.length;
  const totalRevenue = customers.reduce((sum, c: any) => sum + (c.totalSpent || 0), 0);
  const blockedCount = customers.filter(c => !c.active).length;
  const avgSpend = totalAccounts > 0 ? totalRevenue / totalAccounts : 0;

  return (
    <AdminPageWrapper 
      title="Bảo trì tài khoản" 
      description="Quản lý thành viên và phân quyền tài khoản"
      helpContent="Hệ thống quản lý người dùng và bảo mật:
        • Phân quyền: Sử dụng icon Shield để chuyển đổi giữa tài khoản Khách hàng (USER) và Quản trị viên (ADMIN).
        • Khóa tài khoản: Click icon Lock để tạm dừng quyền truy cập của người dùng nếu phát hiện vi phạm.
        • Thống kê chi tiêu: Giúp nhận diện những khách hàng thân thiết có tổng chi tiêu cao.
        • Xem chi tiết: Click icon Eye để xem thông tin liên hệ và lịch sử giao dịch của người dùng."
    >
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tổng tài khoản", value: totalAccounts, icon: Users, color: "bg-blue-100 text-blue-600" },
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
                    <TableCell className="text-right font-semibold text-slate-700">{(customer as any).totalOrders || 0}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {((customer as any).totalSpent || 0).toLocaleString('vi-VN')}đ
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
                      {customer.active ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Đã khóa</Badge>
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
                          title={customer.role === 'ADMIN' ? 'Thu hồi quyền Admin' : 'Cấp quyền Admin'}
                          className="rounded-lg hover:bg-purple-50 hover:text-purple-600 h-8 w-8 p-0"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(customer.id)}
                          title={customer.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          className={`rounded-lg h-8 w-8 p-0 ${customer.active ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-emerald-50 hover:text-emerald-600'}`}
                        >
                          {customer.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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
                      {viewItem.active ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Đã khóa</Badge>
                      )}
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: `${viewItem.username}@gearflow.io` },
                  { label: "Điện thoại", value: viewItem.phone || 'N/A' },
                  { label: "Ngày tham gia", value: new Date(viewItem.createdAt).toLocaleDateString('vi-VN') },
                  { label: "Tổng đơn hàng", value: (viewItem as any).totalOrders || "0" },
                  { label: "Tổng chi tiêu", value: (viewItem as any).totalSpent ? `${(viewItem as any).totalSpent.toLocaleString('vi-VN')}đ` : "0đ" },
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
