"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Heart, Zap } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    salePrice: number | null;
    thumbnail: string | null;
    stock: number;
    weight: number;
  };
}

export function AddToCart({ product }: AddToCartProps) {
  const [qty, setQty] = React.useState(1);
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const { toggle, has } = useWishlist();
  const wished = has(product.id);
  const outOfStock = product.stock <= 0;
  const price = product.salePrice || product.price;

  const add = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.thumbnail || "/placeholders/1.svg",
      price,
      originalPrice: product.price,
      qty,
      stock: product.stock,
      weight: product.weight,
    });
    toast.success("Ditambahkan ke keranjang");
  };

  const buyNow = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.thumbnail || "/placeholders/1.svg",
      price,
      originalPrice: product.price,
      qty,
      stock: product.stock,
      weight: product.weight,
    });
    router.push("/checkout");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Kurangi"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Tambah"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Stok: <span className="font-semibold text-foreground">{product.stock}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          onClick={add}
          disabled={outOfStock}
        >
          <ShoppingBag className="h-4 w-4" />
          {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
        </Button>
        {!outOfStock && (
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            onClick={buyNow}
          >
            <Zap className="h-4 w-4" /> Beli Sekarang
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className={cn("h-12 w-12", wished && "border-rose-500")}
          onClick={() => {
            toggle(product.id);
            toast(wished ? "Dihapus dari wishlist" : "Ditambahkan ke wishlist");
          }}
          aria-label="Wishlist"
        >
          <Heart className={cn("h-5 w-5", wished && "fill-rose-500 text-rose-500")} />
        </Button>
      </div>

      <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
        <ul className="space-y-1.5">
          <li>✓ Garansi original 100%</li>
          <li>✓ Pengiriman cepat ke seluruh Indonesia</li>
          <li>✓ Mudah dikembalikan dalam 7 hari</li>
        </ul>
      </div>
    </div>
  );
}
