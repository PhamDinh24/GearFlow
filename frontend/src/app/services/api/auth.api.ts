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
}

export const authApi = new AuthApiService();
