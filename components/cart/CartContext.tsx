'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types/database';
import { useAuth } from '@/components/auth/AuthContext';
import { mockDB } from '@/lib/supabase/mock-db';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart on initial mount or when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadCart();
    }
  }, [user]);

  const loadCart = () => {
    mockDB.loadFromLocalStorage();

    if (user) {
      // User cart
      const userCart = mockDB.cartItems.filter((i) => i.user_id === user.id);
      // Merge any guest cart from localStorage
      try {
        const guestCartStr = localStorage.getItem('fj_guest_cart');
        if (guestCartStr) {
          const guestCart: CartItem[] = JSON.parse(guestCartStr);
          guestCart.forEach((guestItem) => {
            const existing = userCart.find((i) => i.product_id === guestItem.product_id);
            if (existing) {
              existing.quantity += guestItem.quantity;
            } else {
              userCart.push({ ...guestItem, user_id: user.id });
            }
          });
          localStorage.removeItem('fj_guest_cart');
          mockDB.cartItems = userCart;
          mockDB.saveToLocalStorage();
        }
      } catch {
        // ignore
      }
      setCartItems(userCart);
    } else {
      // Guest cart
      try {
        const saved = localStorage.getItem('fj_guest_cart');
        if (saved) {
          setCartItems(JSON.parse(saved));
        } else {
          setCartItems([]);
        }
      } catch {
        setCartItems([]);
      }
    }
  };

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (user) {
      // Update in mockDB
      const otherUserCarts = mockDB.cartItems.filter((i) => i.user_id !== user.id);
      mockDB.cartItems = [...otherUserCarts, ...items];
      mockDB.saveToLocalStorage();
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('fj_guest_cart', JSON.stringify(items));
      }
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity = 1) => {
    const existingIdx = cartItems.findIndex((i) => i.product_id === product.id);
    let newItems: CartItem[];

    if (existingIdx > -1) {
      newItems = cartItems.map((item, idx) =>
        idx === existingIdx
          ? { ...item, quantity: item.quantity + quantity, product }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: 'ci-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        user_id: user ? user.id : 'guest',
        product_id: product.id,
        quantity,
        product,
        created_at: new Date().toISOString()
      };
      newItems = [...cartItems, newItem];
    }

    saveCart(newItems);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newItems = cartItems.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item
    );
    saveCart(newItems);
  };

  const removeFromCart = (productId: string) => {
    const newItems = cartItems.filter((item) => item.product_id !== productId);
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const prod = item.product || mockDB.products.find((p) => p.id === item.product_id);
    if (!prod) return acc;
    const finalPrice = prod.discount_percent > 0
      ? prod.price * (1 - prod.discount_percent / 100)
      : prod.price;
    return acc + finalPrice * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
