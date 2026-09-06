"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  buyNow: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "morrow-cart";
const EMPTY_CART: CartItem[] = [];

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) {
      return EMPTY_CART;
    }

    const parsed = JSON.parse(saved) as CartItem[];
    return Array.isArray(parsed) ? parsed : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const nextValue = JSON.stringify(items);
    const previousValue = window.localStorage.getItem(CART_STORAGE_KEY);

    if (previousValue === nextValue) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, nextValue);
    window.dispatchEvent(new Event("morrow-cart-change"));
  } catch {
    // ignore write failures
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(EMPTY_CART);

  useEffect(() => {
    const syncFromStorage = () => setItems(readCart());

    syncFromStorage();
    window.addEventListener("morrow-cart-change", syncFromStorage);

    return () => {
      window.removeEventListener("morrow-cart-change", syncFromStorage);
    };
  }, []);

  const updateItems = useCallback((updater: CartItem[] | ((current: CartItem[]) => CartItem[])) => {
    setItems((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      writeCart(next);
      return next;
    });
  }, []);

  const addItem = useCallback((product: Omit<CartItem, "quantity">, quantity = 1) => {
    updateItems((current) => {
      const nextQuantity = Math.max(1, quantity);
      const existing = current.find((item) => item.productId === product.productId);

      if (existing) {
        return current.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + nextQuantity }
            : item
        );
      }

      return [...current, { ...product, quantity: nextQuantity }];
    });
  }, [updateItems]);

  const buyNow = useCallback((product: Omit<CartItem, "quantity">, quantity = 1) => {
    const nextQuantity = Math.max(1, quantity);
    updateItems([{ ...product, quantity: nextQuantity }]);
  }, [updateItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    updateItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== productId);
      }

      return current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, [updateItems]);

  const removeItem = useCallback((productId: string) => {
    updateItems((current) => current.filter((item) => item.productId !== productId));
  }, [updateItems]);

  const clearCart = useCallback(() => updateItems([]), [updateItems]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      addItem,
      buyNow,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [addItem, buyNow, clearCart, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
