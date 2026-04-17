const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_TIMEOUT = 30000;

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class BaseApiService {
  protected getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
        throw new ApiError('Session expired. Please login again.', 401);
      }

      const text = await response.clone().text().catch(() => '');
      let errorData: any = {};
      if (text) {
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { message: text };
        }
      }

      const message =
        errorData?.message ||
        (typeof errorData === 'string' ? errorData : `HTTP ${response.status}: ${response.statusText}`);

      throw new ApiError(
        message,
        response.status,
        errorData?.errors || errorData
      );
    }
    return response.json();
  }

  protected buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${API_BASE_URL}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
}

export { API_BASE_URL };
