import { BaseApiService } from './base';
import { UserDTO } from '../../types';

class UserApiService extends BaseApiService {
  async getUserProfile(id: string): Promise<UserDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/users/${id}`),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<UserDTO>(response);
  }

  async updateUserProfile(id: string, data: Partial<UserDTO>): Promise<UserDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/users/${id}`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<UserDTO>(response);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/users/change-password'),
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ oldPassword, newPassword }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to change password: ${response.status}`);
    }
  }

  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/admin/users', { size: 1000 }),
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    const page = await this.handleResponse<any>(response);
    return page.content || [];
  }

  async updateUserRole(userId: string, role: string): Promise<UserDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/users/${userId}/role`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ role }),
      }
    );
    return this.handleResponse<UserDTO>(response);
  }

  async toggleUserStatus(userId: string): Promise<UserDTO> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/users/${userId}/toggle-status`),
      {
        method: 'PUT',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<UserDTO>(response);
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/admin/users/${userId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
  }

  async uploadUserImage(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/images/users/${userId}`),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await this.handleResponse<{ imageUrl: string }>(response);
    return data.imageUrl;
  }

  async deleteUserImage(userId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl(`/images/users/${userId}`),
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete user image: ${response.status}`);
    }
  }
}

export const userApi = new UserApiService();
