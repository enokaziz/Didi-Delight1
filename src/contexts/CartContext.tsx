import React, { createContext, useContext, useState } from "react";
import { Product } from "../types/Product";

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string, quantity?: number) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Si le produit existe, met à jour la quantité
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity ?? 1) + quantity }
            : item
        );
      }
      // Sinon, ajoute le produit avec la quantité spécifiée
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (id: string, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (!existingItem) return prevCart;

      const currentQuantity = existingItem.quantity ?? 1;
      if (currentQuantity <= quantity) {
        // Si la quantité à supprimer est >= à la quantité actuelle, supprime l'élément
        return prevCart.filter((item) => item.id !== id);
      }
      // Sinon, réduit la quantité
      return prevCart.map((item) =>
        item.id === id ? { ...item, quantity: currentQuantity - quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: quantity > 0 ? quantity : 1 } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé dans un CartProvider");
  }
  return context;
};

export type { CartContextType };