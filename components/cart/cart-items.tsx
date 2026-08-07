"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { formatIDR } from "@/lib/utils";

export function CartItems() {
  const { items, updateQty, removeItem } = useCart();

  if (!items.length) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const hasDiscount = item.originalPrice > item.price;
        return (
          <div
            key={item.productId}
            className="flex gap-4 rounded-2xl border bg-card p-4 soft-shadow"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/products/${item.slug}`}
                  className="line-clamp-2 text-sm font-semibold hover:text-primary"
                >
                  {item.name}
                </Link>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold">
                  {formatIDR(item.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatIDR(item.originalPrice)}
                  </span>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center rounded-full border">
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Kurangi"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="Tambah"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-sm font-bold text-primary">
                  {formatIDR(item.price * item.qty)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
