import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../services/api';
import { CartDTO } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartDTO | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateCartItem: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCart: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const getCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Failed to fetch cart';
      if (!message.includes('Session expired')) {
        setError(message);
      }
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (variantId: string, quantity: number) => {
    if (!isAuthenticated) throw new Error('Please login first');

    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartApi.addToCart(variantId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Failed to add to cart';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateCartItem = useCallback(async (variantId: string, quantity: number) => {
    if (!isAuthenticated) throw new Error('Please login first');

    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartApi.updateCartItem(variantId, quantity);
      setCart(updatedCart);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Failed to update cart';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const removeFromCart = useCallback(async (variantId: string) => {
    if (!isAuthenticated) throw new Error('Please login first');

    setIsLoading(true);
    setError(null);

    try {
      const updatedCart = await cartApi.removeFromCart(variantId);
      setCart(updatedCart);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Failed to remove from cart';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const clearCartHandler = useCallback(async () => {
    if (!isAuthenticated) throw new Error('Please login first');

    setIsLoading(true);
    setError(null);

    try {
      await cartApi.clearCart();
      setCart(null);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Failed to clear cart';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getCart();
    }
  }, [isAuthenticated, getCart]);

  const cartCount = cart?.items?.length || 0;

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart: clearCartHandler,
    getCart,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
