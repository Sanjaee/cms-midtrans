"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/store/wishlist-store";
import { useCart } from "@/store/cart-store";
import { formatIDR, cn } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
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
  };
  className?: string;
}

const badgeLabels: Record<string, { label: string; variant: "brand" | "warning" | "info" | "success" }> = {
  best_seller: { label: "Best Seller", variant: "brand" },
  new: { label: "Baru", variant: "info" },
  limited: { label: "Limited", variant: "warning" },
  promo: { label: "Promo", variant: "success" },
};

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { toggle, has } = useWishlist();
  const addItem = useCart((s) => s.addItem);
  const wished = has(product.id);
  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const badge = badgeLabels[product.badge];
  const outOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.thumbnail || "/placeholders/1.svg",
      price,
      originalPrice: product.price,
      qty: 1,
      stock: product.stock,
      weight: product.weight,
    });
    toast.success("Ditambahkan ke keranjang");
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.thumbnail || "/placeholders/1.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {hasDiscount && (
          <Badge className="absolute left-3 top-3">
            -{product.discountPct || Math.round((1 - price / product.price) * 100)}%
          </Badge>
        )}
        {badge && (
          <Badge
            variant={badge.variant}
            className="absolute right-3 top-3 backdrop-blur"
          >
            {badge.label}
          </Badge>
        )}
        {product.isFlashSale && (
          <Badge variant="destructive" className="absolute bottom-3 left-3">
            Flash Sale
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Badge variant="outline" className="bg-white/20 text-white">
              Stok Habis
            </Badge>
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
            toast(wished ? "Dihapus dari wishlist" : "Ditambahkan ke wishlist");
          }}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100",
            wished && "md:opacity-100",
          )}
          aria-label="Wishlist"
        >
          <Heart
            className={cn("h-4 w-4", wished && "fill-rose-500 text-rose-500")}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.category?.name || "Zacode Store"}
          </p>
          <Rating value={Number(product.rating) || 0} count={product.ratingCount} />
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              {formatIDR(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatIDR(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="bg-primary flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground shadow-sm transition-transform hover:scale-110 disabled:opacity-40"
            aria-label="Tambah ke keranjang"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
