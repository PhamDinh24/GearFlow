import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiService } from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface User {
  id: string;
  username: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
}

export const AdminCustomers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      // Ensure data is an array
      const usersArray = Array.isArray(data) ? data : [];
      console.log('Loaded users:', usersArray);
      setUsers(usersArray);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDialog(true);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiService.updateUserRole(userId, newRole);
      loadUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser({...selectedUser, role: newRole});
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Lỗi khi cập nhật vai trò người dùng');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    try {
      await apiService.deleteUser(userId);
      loadUsers();
      setShowDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa người dùng');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Quản Lý Khách Hàng</h1>

      <div className="flex gap-4">
        <Input
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <select
          className="border rounded px-4 py-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="USER">Người dùng</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Tên Đăng Nhập</th>
                  <th className="text-left p-4">Số Điện Thoại</th>
                  <th className="text-left p-4">Địa Chỉ</th>
                  <th className="text-left p-4">Vai Trò</th>
                  <th className="text-left p-4">Ngày Tạo</th>
                  <th className="text-left p-4">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{user.username}</td>
                    <td className="p-4">{user.phone || 'N/A'}</td>
                    <td className="p-4">{user.address || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        Chi Tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
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
                    Người Dùng
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedUser.role === 'ADMIN' ? 'default' : 'outline'}
                    onClick={() => handleUpdateRole(selectedUser.id, 'ADMIN')}
                  >
                    Quản Trị Viên
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  Xóa Người Dùng
                </Button>
                <Button onClick={() => setShowDialog(false)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
