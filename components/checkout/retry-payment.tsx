"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";
import {
  retryPaymentAction,
  completeTestPaymentAction,
} from "@/lib/order-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RetryPayment({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const retry = async () => {
    setLoading(true);
    const result = await retryPaymentAction(orderId);
    if (result.error) {
      setLoading(false);
      toast.error(result.error);
      return;
    }

    if (result.testMode) {
      const testRes = await completeTestPaymentAction(orderId);
      setLoading(false);
      if (testRes.success) {
        toast.success("Pembayaran mode uji berhasil");
        router.push(`/checkout/success?order=${orderId}`);
      } else {
        toast.error(testRes.error || "Gagal memproses pembayaran uji");
      }
      return;
    }

    const clientKey =
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
      "SB-Mid-client-placeholder";
    const loadSnap = (cb: () => void) => {
      if (window.snap) return cb();
      const script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", clientKey);
      script.onload = () => cb();
      document.body.appendChild(script);
    };
    loadSnap(() => {
      window.snap!.pay(result.snapToken as string, {
        onSuccess: () => router.push(`/checkout/success?order=${orderId}`),
        onPending: () => router.push(`/checkout/failed?order=${orderId}&pending=1`),
        onError: () => router.push(`/checkout/failed?order=${orderId}`),
        onClose: () => router.push(`/account/orders/${orderId}`),
      });
    });
  };

  return (
    <Button size="lg" onClick={retry} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCcw className="h-4 w-4" />
      )}
      {loading ? "Memproses..." : "Coba Bayar Lagi"}
    </Button>
  );
}
