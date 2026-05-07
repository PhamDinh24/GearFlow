import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type AuthResponse } from '../services/authService';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (data: { username: string; email: string; phone: string; password: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('Loaded user from localStorage:', userData); // Debug log
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            role: (userData.role?.toUpperCase() === 'ADMIN' || userData.role?.toLowerCase() === 'admin') ? 'admin' : 'user',
            createdAt: userData.createdAt || new Date().toISOString(),
            avatar: userData.imageUrl || '',
          });
        }
      } catch (error) {
        console.error('Failed to load user from localStorage:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const response: AuthResponse = await authService.login({
        username: usernameOrEmail,
        password,
      });

      // Save tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Set user state - Check both uppercase and lowercase for role
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email || '',
        phone: response.user.phone || '',
        address: response.user.address || '',
        role: (response.user.role?.toUpperCase() === 'ADMIN' || response.user.role?.toLowerCase() === 'admin') ? 'admin' : 'user',
        createdAt: response.user.createdAt,
        avatar: response.user.imageUrl || '',
      };
      console.log('Login successful, user role:', userData.role, 'from backend:', response.user.role); // Debug
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Email/Username hoặc mật khẩu không đúng';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (data: { username: string; email: string; phone: string; password: string; address?: string }) => {
    try {
      const response: AuthResponse = await authService.register(data);

      // Save tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Set user state - Check both uppercase and lowercase for role
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email || '',
        phone: response.user.phone || '',
        address: response.user.address || '',
        role: (response.user.role?.toUpperCase() === 'ADMIN' || response.user.role?.toLowerCase() === 'admin') ? 'admin' : 'user',
        createdAt: response.user.createdAt,
        avatar: response.user.imageUrl || '',
      };
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      // Update localStorage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...savedUser, ...data }));
    }
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      register,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
