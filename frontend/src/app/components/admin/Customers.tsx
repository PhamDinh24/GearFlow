import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AdminPageWrapper } from './PageWrapper';
import { userApi } from '../../services/api';
import { UserDTO } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Search, Users, UserCheck, Shield, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Customers() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng Người Dùng</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Khách Hàng</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quản Trị Viên</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Người Dùng</CardTitle>
        </CardHeader>
        <CardContent>
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
              className="border rounded px-4 py-2 min-w-[150px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="USER">Khách hàng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Người Dùng</th>
                  <th className="text-left p-4 font-semibold">Số Điện Thoại</th>
                  <th className="text-left p-4 font-semibold">Địa Chỉ</th>
                  <th className="text-left p-4 font-semibold">Vai Trò</th>
                  <th className="text-left p-4 font-semibold">Ngày Tạo</th>
                  <th className="text-left p-4 font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-4">{user.phone || '-'}</td>
                    <td className="p-4 max-w-xs truncate">{user.address || '-'}</td>
                    <td className="p-4">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(user)}
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
            <div className="text-center py-12 text-gray-500">
              {searchTerm || roleFilter !== 'ALL' 
                ? 'Không tìm thấy người dùng nào' 
                : 'Chưa có người dùng nào'}
            </div>
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

