import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Pagination } from '../ui/pagination';
import { AdminPageWrapper } from './PageWrapper';
import { userApi } from '../../services/api';
import { UserDTO } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Search, Users, UserCheck, Shield, Edit, Trash2, FileSpreadsheet, FileText, File, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { 
  exportToExcel, 
  exportToPDF, 
  exportToWord,
  exportToExcelTable,
  formatDateForExport,
  generateFilename
} from '../../utils/exportUtils';

const ITEMS_PER_PAGE = 12;

export function Customers() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      
      // Sort users by createdAt (newest first)
      const sortedUsers = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: UserDTO) => {
    setSelectedUser(user);
    setShowDialog(true);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await userApi.updateUserRole(userId, newRole);
      toast.success('Cập nhật vai trò thành công');
      
      // Immediate UI update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Không thể cập nhật vai trò');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    try {
      await userApi.deleteUser(userId);
      toast.success('Xóa người dùng thành công');
      
      // Immediate UI update
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDialog(false);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Không thể xóa người dùng');
    }
  };

  const exportToExcelHandler = () => {
    const metadata = {
      'Hệ thống': 'GearFlow Management',
      'Ngày xuất': formatDateForExport(new Date().toISOString()),
      'Người xuất': 'Administrator',
      'Tổng số': `${filteredUsers.length} người dùng`,
    };

    const headers = ['STT', 'Tên đăng nhập', 'Số điện thoại', 'Địa chỉ', 'Vai trò', 'Ngày tạo'];
    
    const data = filteredUsers.map((user, index) => [
      index + 1,
      user.username,
      user.phone || 'Chưa cập nhật',
      user.address || 'Chưa cập nhật',
      user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng',
      formatDateForExport(user.createdAt),
    ]);

    const result = exportToExcelTable(
      'DANH SÁCH NGƯỜI DÙNG',
      metadata,
      headers,
      data,
      generateFilename('danh-sach-nguoi-dung')
    );
    
    if (result.success) {
      toast.success('Đã xuất file Excel thành công');
    } else {
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  const exportToPDFHandler = () => {
    const headers = ['Tên đăng nhập', 'Số điện thoại', 'Địa chỉ', 'Vai trò', 'Ngày tạo'];
    const data = filteredUsers.map((user) => [
      user.username,
      user.phone || 'Chưa cập nhật',
      user.address || 'Chưa cập nhật',
      user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng',
      formatDateForExport(user.createdAt),
    ]);

    const result = exportToPDF(
      'Danh Sách Người Dùng',
      headers,
      data,
      generateFilename('danh-sach-nguoi-dung')
    );
    
    if (result.success) {
      toast.success('Đã xuất file PDF thành công');
    } else {
      toast.error('Lỗi khi xuất file PDF');
    }
  };

  const exportToWordHandler = async () => {
    const headers = ['Tên đăng nhập', 'Số điện thoại', 'Địa chỉ', 'Vai trò', 'Ngày tạo'];
    const data = filteredUsers.map((user) => [
      user.username,
      user.phone || 'Chưa cập nhật',
      user.address || 'Chưa cập nhật',
      user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng',
      formatDateForExport(user.createdAt),
    ]);

    const result = await exportToWord(
      'Danh Sách Người Dùng',
      headers,
      data,
      generateFilename('danh-sach-nguoi-dung')
    );
    
    if (result.success) {
      toast.success('Đã xuất file Word thành công');
    } else {
      toast.error('Lỗi khi xuất file Word');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    users: users.filter(u => u.role === 'USER').length,
  };

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper 
      title="Quản Lý Khách Hàng" 
      description="Xem và quản lý thông tin người dùng trong hệ thống"
      actions={(
        <>
          <Button onClick={loadUsers} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={exportToExcelHandler} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button onClick={exportToPDFHandler} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button onClick={exportToWordHandler} variant="outline">
            <File className="w-4 h-4 mr-2" />
            Xuất Word
          </Button>
        </>
      )}
    >
      {/* Stats Cards - Enhanced with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Tổng Người Dùng</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.total}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Đã đăng ký</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-green-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Khách Hàng</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.users}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Người dùng thường</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ring-4 ring-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Quản Trị Viên</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stats.admins}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Có quyền quản lý</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '35%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table - Enhanced */}
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Danh Sách Người Dùng</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">{filteredUsers.length} người dùng</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded-lg px-4 py-2 min-w-[180px] bg-white hover:border-blue-400 transition-colors"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="USER">👤 Khách hàng</option>
              <option value="ADMIN">👑 Quản trị viên</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Người Dùng</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Số Điện Thoại</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Địa Chỉ</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Vai Trò</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Ngày Tạo</th>
                  <th className="text-left p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          {user.role === 'ADMIN' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                              <Shield className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.username}</span>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-700">{user.phone || '-'}</span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <span className="text-gray-600 truncate block">{user.address || '-'}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className={`font-bold shadow-sm ${
                        user.role === 'ADMIN' 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-600 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleTimeString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all font-medium"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Chi Tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {searchTerm || roleFilter !== 'ALL' 
                  ? 'Không tìm thấy người dùng nào' 
                  : 'Chưa có người dùng nào'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="user-dialog-description">
          <DialogHeader>
            <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
            <DialogDescription id="user-dialog-description">
              Xem và chỉnh sửa thông tin người dùng
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-mono text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tên Đăng Nhập</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số Điện Thoại</p>
                  <p>{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa Chỉ</p>
                  <p>{selectedUser.address || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày Tạo</p>
                  <p>{new Date(selectedUser.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Vai Trò</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedUser.role === 'USER' ? 'default' : 'outline'}
                    onClick={() => handleUpdateRole(selectedUser.id, 'USER')}
                  >
                    👤 Người Dùng
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedUser.role === 'ADMIN' ? 'default' : 'outline'}
                    onClick={() => handleUpdateRole(selectedUser.id, 'ADMIN')}
                  >
                    👑 Quản Trị Viên
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex justify-between pt-4 border-t">
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa Người Dùng
                </Button>
                <Button onClick={() => setShowDialog(false)}>Đóng</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
}

