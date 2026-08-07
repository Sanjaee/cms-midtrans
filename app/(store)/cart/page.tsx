import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Keranjang Belanja",
  description: "Keranjang belanja Anda di Nova Store.",
};

export default function CartPage() {
  return <CartView />;
}
