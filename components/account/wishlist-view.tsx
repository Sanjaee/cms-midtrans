"use client";

import { useQuery } from "@tanstack/react-query";
import { useWishlist } from "@/store/wishlist-store";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart } from "lucide-react";
import Link from "next/link";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  discountPct: number;
  thumbnail: string | null;
  stock: number;
  weight: number;
  rating: string | number;
  ratingCount: number;
  badge: string;
  isFlashSale: boolean;
  category?: { name: string; slug: string } | null;
}

export function WishlistView() {
  const items = useWishlist((s) => s.items);

  const { data, isLoading } = useQuery<WishlistProduct[]>({
    queryKey: ["wishlist", items],
    queryFn: async () => {
      if (!items.length) return [];
      const res = await fetch(`/api/products/by-ids?ids=${items.join(",")}`);
      const json = await res.json();
      return json.products;
    },
    enabled: items.length > 0,
  });

  if (!items.length) {
    return (
      <EmptyState
        icon={<Heart className="h-6 w-6" />}
        title="Wishlist kosong"
        description="Tekan ikon hati pada produk untuk menyimpannya di sini."
        action={
          <Link href="/products" className="text-sm font-semibold text-primary underline">
            Jelajahi Produk
          </Link>
        }
      />
    );
  }

  if (isLoading) return <ProductGridSkeleton count={4} />;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {data?.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
