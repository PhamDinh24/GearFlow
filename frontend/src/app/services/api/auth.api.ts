import { BaseApiService } from './base';
import { AuthRequest, RegisterRequest, AuthResponse } from '../../types';

class AuthApiService extends BaseApiService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/auth/register'),
      {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<AuthResponse>(response);
  }

  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/auth/login'),
      {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse<AuthResponse>(response);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/auth/refresh', { refreshToken }),
      {
        method: 'POST',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<AuthResponse>(response);
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/auth/forgot-password', { email }),
      {
        method: 'POST',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<void>(response);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      this.buildUrl('/auth/reset-password', { token, newPassword }),
      {
        method: 'POST',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<void>(response);
  }
}

export const authApi = new AuthApiService();
