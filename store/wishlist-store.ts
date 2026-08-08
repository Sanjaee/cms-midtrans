"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) =>
        set({
          items: get().items.includes(productId)
            ? get().items.filter((i) => i !== productId)
            : [...get().items, productId],
        }),
      has: (productId) => get().items.includes(productId),
    }),
    { name: "zacode-wishlist" },
  ),
);
