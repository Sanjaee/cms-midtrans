"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Tag, Loader2 } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatIDR } from "@/lib/utils";
import { toast } from "sonner";

export function CartSummary() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = React.useState(coupon?.code || "");
  const [loading, setLoading] = React.useState(false);

  const validate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const res = await fetch(
      `/api/coupons/validate?code=${encodeURIComponent(code.trim())}`,
    );
    const data = await res.json();
    setLoading(false);
    if (data.valid) {
      setCoupon(data);
      toast.success("Kupon berhasil diterapkan!");
    } else {
      setCoupon(null);
      toast.error(data.error || "Kupon tidak valid");
    }
  };

  let discount = 0;
  if (coupon) {
    if (coupon.type === "percent") {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    if (subtotal < coupon.minSpend) discount = 0;
  }
  const total = Math.max(0, subtotal - discount);

  if (!items.length) return null;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-24">
      <h3 className="text-lg font-bold">Ringkasan Belanja</h3>

      <div className="mt-4">
        <div className="flex gap-2">
          <Input
            placeholder="Kode kupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={validate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Tag className="h-4 w-4" />
            )}
          </Button>
        </div>
        {coupon && (
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            ✓ Kupon {coupon.code} berlaku
          </p>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{formatIDR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Diskon</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            -{formatIDR(discount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ongkir</span>
          <span className="text-muted-foreground">Dihitung saat checkout</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-base font-bold">
        <span>Total</span>
        <span>{formatIDR(total)}</span>
      </div>

      <Button
        className="mt-5 w-full"
        size="lg"
        onClick={() => router.push("/checkout")}
      >
        Lanjut ke Checkout
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Pengiriman dan metode pembayaran dipilih saat checkout
      </p>
    </div>
  );
}
