import { createContext, useContext, useState, type ReactNode } from "react";

import type { CartItem, Dish } from "@/types";

// La "forma" di ciò che il carrello mette a disposizione alle schermate.
type CartContextValue = {
  items: CartItem[];
  count: number; // quantità totale di articoli
  subtotal: number; // somma prezzi × quantità
  add: (dish: Dish) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  remove: (dishId: string) => void;
  clear: () => void;
};

// Il Context parte "vuoto" (null): lo riempie il Provider qui sotto.
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // L'unica vera "memoria": la lista degli articoli. Tutto il resto si deriva.
  const [items, setItems] = useState<CartItem[]>([]);

  function add(dish: Dish) {
    setItems((prev) => {
      const existing = prev.find((i) => i.dish.id === dish.id);
      if (existing) {
        // già presente → aumento la quantità
        return prev.map((i) => (i.dish.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      // nuovo piatto → lo aggiungo con quantità 1
      return [...prev, { dish, qty: 1 }];
    });
  }

  function increment(dishId: string) {
    setItems((prev) => prev.map((i) => (i.dish.id === dishId ? { ...i, qty: i.qty + 1 } : i)));
  }

  function decrement(dishId: string) {
    setItems((prev) =>
      prev
        .map((i) => (i.dish.id === dishId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0), // se arriva a 0, sparisce dal carrello
    );
  }

  function remove(dishId: string) {
    setItems((prev) => prev.filter((i) => i.dish.id !== dishId));
  }

  function clear() {
    setItems([]);
  }

  // Valori derivati: ricalcolati a ogni render, non salvati in stato.
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.dish.price, 0);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, add, increment, decrement, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook comodo: ogni schermata fa `const cart = useCart()`.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve essere usato dentro <CartProvider>");
  }
  return ctx;
}
