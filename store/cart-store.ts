"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  qty: number;
  stock: number;
  weight: number;
}

export interface CartCoupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  maxDiscount: number | null;
  freeShipping: boolean;
}

interface CartState {
  items: CartItem[];
  coupon: CartCoupon | null;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  setCoupon: (coupon: CartCoupon | null) => void;
  clearCart: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId,
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, qty: Math.min(i.qty + (item.qty ?? 1), i.stock) }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...item, qty: item.qty ?? 1 },
            ],
          });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQty: (productId, qty) =>
        set({
          items: get()
            .items.map((i) =>
              i.productId === productId
                ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) }
                : i,
            )
            .filter((i) => i.qty > 0),
        }),
      setCoupon: (coupon) => set({ coupon }),
      clearCart: () => set({ items: [], coupon: null }),
      count: () => get().items.reduce((acc, i) => acc + i.qty, 0),
      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
    }),
    { name: "nova-cart" },
  ),
);
