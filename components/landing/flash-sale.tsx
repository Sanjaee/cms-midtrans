"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { ProductCard } from "@/components/product-card";

interface FlashSaleProps {
  products: ComponentProps<typeof ProductCard>["product"][];
  endsAt: string;
}

export function FlashSaleSection({ products, endsAt }: FlashSaleProps) {
  if (!products.length) return null;
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-primary opacity-10" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-md text-primary-foreground shadow-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Flash Sale
              </h2>
              <p className="text-sm text-muted-foreground">
                Penawaran terbatas, jangan sampai kehabisan!
              </p>
            </div>
          </div>
          <Countdown target={endsAt} size="sm" className="!bg-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/products?sort=discount"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Lihat Semua Promo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
