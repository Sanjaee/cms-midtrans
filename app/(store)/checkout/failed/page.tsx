import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RetryPayment } from "@/components/checkout/retry-payment";

export const metadata: Metadata = { title: "Pembayaran Gagal" };

export const dynamic = "force-dynamic";

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; pending?: string }>;
}) {
  const { order, pending } = await searchParams;
  if (!order) redirect("/");

  const user = await getSession();
  if (!user) redirect("/auth/login");

  const [orderRow] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, order));
  if (!orderRow || orderRow.userId !== user.id) redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/15">
        {pending ? (
          <Clock className="h-10 w-10 text-amber-500" />
        ) : (
          <XCircle className="h-10 w-10 text-rose-500" />
        )}
      </div>
      <h1 className="mt-6 text-3xl font-bold">
        {pending ? "Pembayaran Menunggu" : "Pembayaran Gagal"}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        {pending
          ? "Pembayaran Anda sedang diproses atau belum selesai. Anda dapat menyelesaikannya kapan saja."
          : "Pembayaran Anda tidak berhasil. Jangan khawatir, pesanan Anda tetap tersimpan dan dapat dibayar ulang."}
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border bg-card p-6 text-left shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">No. Pesanan</span>
            <span className="font-semibold">{orderRow.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-base font-bold">
              {formatIDR(orderRow.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {orderRow.paymentStatus !== "paid" && (
          <RetryPayment orderId={orderRow.id} />
        )}
        <Button asChild size="lg" variant="outline">
          <Link href="/products">Lanjut Belanja</Link>
        </Button>
      </div>
    </div>
  );
}
