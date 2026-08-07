"use client";

import type { ComponentProps } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/landing/section-heading";

type ProductCardData = ComponentProps<typeof ProductCard>["product"];

interface ProductTabsProps {
  featured: ProductCardData[];
  newest: ProductCardData[];
  bestsellers: ProductCardData[];
}

export function ProductTabsSection({
  featured,
  newest,
  bestsellers,
}: ProductTabsProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Produk Pilihan"
          title="Koleksi Terbaik Kami"
          description="Kurasi produk pilihan dengan kualitas terbaik untuk Anda."
        />
        <Tabs defaultValue="featured" className="mx-auto max-w-5xl">
          <TabsList className="mx-auto mb-8 flex w-fit">
            <TabsTrigger value="featured">Produk Unggulan</TabsTrigger>
            <TabsTrigger value="newest">Terbaru</TabsTrigger>
            <TabsTrigger value="bestseller">Terlaris</TabsTrigger>
          </TabsList>
          {[
            { value: "featured", items: featured },
            { value: "newest", items: newest },
            { value: "bestseller", items: bestsellers },
          ].map(({ value, items }) => (
            <TabsContent key={value} value={value}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.slice(0, 8).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
