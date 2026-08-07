"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function CartView() {
  const items = useCart((s) => s.items);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Keranjang Belanja
        </h1>
        <div className="mt-8">
          <EmptyState
            icon={<ShoppingCart className="h-6 w-6" />}
            title="Keranjang Anda kosong"
            description="Mulai belanja produk premium pilihan kami."
            action={
              <Button asChild>
                <Link href="/products">
                  Belanja Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Keranjang Belanja
      </h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <CartItems />
        <CartSummary />
      </div>
    </div>
  );
}
