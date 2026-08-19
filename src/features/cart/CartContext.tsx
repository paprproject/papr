import { createContext, useContext, useState } from "react";
import type { Product } from "../../types/product";

export type CartItem = {
  id: string;
  product: Product;
  size: string;
  material: string;
  quantity: string;
  finish?: string;
  sides?: string;
  turnaround?: string;
  designMethod?: string;
  designFileName?: string;
  unitPrice?: number;
  totalPrice?: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  function addToCart(item: CartItem) {
    setCartItems((currentItems) => [...currentItems, item]);
  }

  function removeFromCart(id: string) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// This hook intentionally lives beside its provider so cart state has one public entry point.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
