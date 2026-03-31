const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_TIMEOUT = 30000;

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface UserDTO {
  id: string;
  username: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  brandId: string;
  support?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariantDTO[];
  attributes?: ProductAttributeDTO[];
  averageRating?: number;
  reviewCount?: number;
  stock: number;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  switchType?: string;
  color?: string;
  keycapSet?: string;
  connectType?: string;
  priceModifier: number;
  stock: number;
}

export interface ProductAttributeDTO {
  id: string;
  productId: string;
  attrName: string;
  attrValue: string;
}

export interface BrandDTO {
  id: string;
  name: string;
  description?: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
}

export interface ReviewDTO {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

export interface CartItemDTO {
  variantId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartDTO {
  id: string;
  userId: string;
  items: CartItemDTO[];
  totalPrice: number;
}

export interface OrderDTO {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingPhone?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemDTO[];
}

export interface OrderItemDTO {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderRequest {
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
}

export interface PaymentDTO {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export interface WishlistDTO {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  addedAt: string;
}

class ApiService {
  private getHeaders(includeAuth = true): HeadersInit {
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

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    deduplicate = true
  ): Promise<Response> {
    // Request deduplication for GET requests
    const cacheKey = `${options.method || 'GET'}:${url}`;
    if (deduplicate && (options.method === 'GET' || !options.method)) {
      const pending = pendingRequests.get(cacheKey);
      if (pending) {
        return pending;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const fetchPromise = (async () => {
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
      } finally {
        // Clean up pending request
        if (deduplicate) {
          pendingRequests.delete(cacheKey);
        }
      }
    })();

    if (deduplicate && (options.method === 'GET' || !options.method)) {
      pendingRequests.set(cacheKey, fetchPromise);
    }

    return fetchPromise;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear auth data and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Session expired. Please login again.');
      }
      
      // Clone response before reading to avoid "body stream already read" error
      const errorData = await response.clone().json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Auth Endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
      {
        method: 'POST',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<AuthResponse>(response);
  }

  // Product Endpoints
  async getProducts(page = 0, size = 10): Promise<any> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/products?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<any>(response);
  }

  async getProductById(id: string): Promise<ProductDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse<ProductDTO>(response);
  }

  async searchProducts(keyword: string, page = 0, size = 10): Promise<any> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: this.getHeaders(false),
      }
    );
    return this.handleResponse<any>(response);
  }

  // Cart Endpoints
  async getCart(): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<CartDTO>(response);
  }

  async addToCart(variantId: string, quantity: number): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ variantId, quantity }),
    });
    return this.handleResponse<CartDTO>(response);
  }

  async updateCartItem(variantId: string, quantity: number): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/cart/items/${variantId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ quantity }),
    });
    return this.handleResponse<CartDTO>(response);
  }

  async removeFromCart(variantId: string): Promise<CartDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/cart/items/${variantId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<CartDTO>(response);
  }

  async clearCart(): Promise<void> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to clear cart: ${response.status}`);
    }
  }

  // Order Endpoints
  async createOrder(data: OrderRequest): Promise<OrderDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<OrderDTO>(response);
  }

  async getOrders(): Promise<OrderDTO[]> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<OrderDTO[]>(response);
  }

  async getAllOrders(): Promise<OrderDTO[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/orders`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });
      return this.handleResponse<OrderDTO[]>(response);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async getOrderById(id: string): Promise<OrderDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<OrderDTO>(response);
  }

  async cancelOrder(orderId: string): Promise<OrderDTO> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/orders/${orderId}/cancel`,
      {
        method: 'POST',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<OrderDTO>(response);
  }

  // Payment Endpoints
  async createPayment(orderId: string, paymentMethod: string): Promise<PaymentDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/payment`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ orderId, paymentMethod }),
    });
    return this.handleResponse<PaymentDTO>(response);
  }

  async getPaymentVnpayUrl(paymentId: string): Promise<{ url: string }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/payment/${paymentId}/vnpay-url`,
      {
        method: 'GET',
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse<{ url: string }>(response);
  }

  async getPayment(paymentId: string): Promise<PaymentDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/payment/${paymentId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<PaymentDTO>(response);
  }

  // User Endpoints
  async getUserProfile(id: string): Promise<UserDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<UserDTO>(response);
  }

  async updateUserProfile(id: string, data: Partial<UserDTO>): Promise<UserDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<UserDTO>(response);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!response.ok) {
      throw new Error(`Failed to change password: ${response.status}`);
    }
  }

  // Wishlist Endpoints
  async addToWishlist(productId: string): Promise<WishlistDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<WishlistDTO>(response);
  }

  async removeFromWishlist(productId: string): Promise<void> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to remove from wishlist: ${response.status}`);
    }
  }

  async getWishlist(): Promise<WishlistDTO[]> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/wishlist`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<WishlistDTO[]>(response);
  }

  async isInWishlist(productId: string): Promise<boolean> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/wishlist/check/${productId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<boolean>(response);
  }

  // Brand Endpoints
  async getBrands(): Promise<BrandDTO[]> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/brands`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse<BrandDTO[]>(response);
  }

  // Category Endpoints
  async getCategories(): Promise<CategoryDTO[]> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse<CategoryDTO[]>(response);
  }

  // Review Endpoints
  async getProductReviews(productId: string): Promise<ReviewDTO[]> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/reviews/product/${productId}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse<ReviewDTO[]>(response);
  }

  async createReview(productId: string, rating: number, comment: string): Promise<ReviewDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ productId, rating, comment }),
    });
    return this.handleResponse<ReviewDTO>(response);
  }

  // Admin Endpoints
  async getAnalytics(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/dashboard/stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });
      return this.handleResponse<any>(response);
    } catch (error) {
      // Fallback if endpoint doesn't exist
      return { totalRevenue: 0, totalOrders: 0, totalUsers: 0 };
    }
  }

  async createProduct(data: any): Promise<ProductDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ProductDTO>(response);
  }

  async updateProduct(id: string, data: any): Promise<ProductDTO> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ProductDTO>(response);
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse<any>(response);
  }

  async getUsers(): Promise<any[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });
      const data = await this.handleResponse<any>(response);
      // Backend returns Page object with content array
      return data.content || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback - return empty array if endpoint doesn't exist
      return [];
    }
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse<any>(response);
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
  }

  async updateStock(variantId: string, quantity: number): Promise<any> {
    try {
      // Backend expects quantity as query parameter
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/admin/stock/${variantId}?quantity=${quantity}`, 
        {
          method: 'PUT',
          headers: this.getHeaders(true),
        }
      );
      return this.handleResponse<any>(response);
    } catch (error) {
      // If admin endpoint doesn't exist, try stock endpoint
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/stock/${variantId}?quantity=${quantity}`, 
        {
          method: 'PUT',
          headers: this.getHeaders(true),
        }
      );
      return this.handleResponse<any>(response);
    }
  }
}

export const apiService = new ApiService();
