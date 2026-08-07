import type { Metadata } from "next";
import { WishlistView } from "@/components/account/wishlist-view";

export const metadata: Metadata = { title: "Wishlist Saya" };

export default function WishlistPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Wishlist Saya</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Produk yang Anda simpan untuk dibeli nanti.
      </p>
      <WishlistView />
    </div>
  );
}
