import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pesanan Berhasil" };

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  if (!order) redirect("/");

  const user = await getSession();
  if (!user) redirect("/auth/login");

  const [orderRow] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, order));
  if (!orderRow || orderRow.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Pesanan Berhasil! 🎉</h1>
      <p className="mt-3 text-muted-foreground">
        Terima kasih telah berbelanja. Pesanan Anda{" "}
        <span className="font-semibold text-foreground">
          {orderRow.orderNumber}
        </span>{" "}
        telah dibuat dengan total{" "}
        <span className="font-semibold text-foreground">
          {formatIDR(orderRow.total)}
        </span>
        .
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border bg-card p-6 text-left soft-shadow">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ringkasan Pesanan
        </h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">No. Pesanan</span>
            <span className="font-semibold">{orderRow.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold text-amber-500">
              Menunggu Pembayaran
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pembayaran</span>
            <span className="font-semibold">
              {orderRow.paymentMethod || "Midtrans"}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Total</span>
            <span className="text-base font-bold">
              {formatIDR(orderRow.total)}
            </span>
          </div>
        </div>
      </div>

      {orderRow.paymentStatus !== "paid" && (
        <p className="mt-4 text-sm text-muted-foreground">
          Jika pembayaran belum selesai, Anda dapat menyelesaikannya dari
          halaman detail pesanan.
        </p>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={`/account/orders/${orderRow.id}`}>Lihat Detail Pesanan</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/products">Lanjut Belanja</Link>
        </Button>
      </div>
    </div>
  );
}
