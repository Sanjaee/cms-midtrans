import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, midtransPayments } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { formatIDR, formatDate, formatDateTime } from "@/lib/utils";
import { statusLabel, statusColor } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "@/components/account/print-button";
import { RetryPayment } from "@/components/checkout/retry-payment";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Detail Pesanan" };

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSession();
  if (!user) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order || order.userId !== user.id) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const payments = await db
    .select()
    .from(midtransPayments)
    .where(eq(midtransPayments.orderId, order.id))
    .orderBy(midtransPayments.createdAt);

  return (
    <div>
      <div className="no-print flex items-center justify-between">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <PrintButton />
      </div>

      <div id="invoice" className="mt-6 rounded-2xl border bg-card p-6 soft-shadow">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-lg text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">INVOICE</h1>
              <p className="text-xs text-muted-foreground">
                {order.orderNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tanggal Pesanan</p>
            <p className="text-sm font-semibold">
              {formatDateTime(order.createdAt)}
            </p>
            <Badge className={`mt-1 ${statusColor(order.status)}`}>
              {statusLabel(order.status)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 py-5 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pengiriman Ke
            </h3>
            <p className="mt-2 text-sm font-semibold">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {order.addressLine}
              <br />
              {order.city}, {order.province} {order.postalCode}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pengiriman
            </h3>
            <p className="mt-2 text-sm">
              {order.shippingCourier} — {order.shippingService}
            </p>
            {order.trackingNumber && (
              <p className="mt-1 text-sm">
                No. Resi:{" "}
                <span className="font-semibold">{order.trackingNumber}</span>
              </p>
            )}
            {order.paymentMethod && (
              <p className="mt-1 text-sm text-muted-foreground">
                Pembayaran: {order.paymentMethod}
              </p>
            )}
            {payments.find((p) => p.vaNumber) && (
              <p className="mt-1 text-sm">
                VA:{" "}
                <span className="font-semibold">
                  {payments.find((p) => p.vaNumber)?.vaNumber}
                </span>
              </p>
            )}
          </div>
        </div>

        <Separator />

        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-3">Produk</th>
              <th className="pb-3 text-center">Qty</th>
              <th className="pb-3 text-right">Harga</th>
              <th className="pb-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                        unoptimized
                      />
                    )}
                    <span className="font-medium">{item.productName}</span>
                  </div>
                </td>
                <td className="py-3 text-center">{item.qty}</td>
                <td className="py-3 text-right">{formatIDR(item.price)}</td>
                <td className="py-3 text-right font-semibold">
                  {formatIDR(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatIDR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diskon</span>
            <span className="text-emerald-500">-{formatIDR(order.discount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkir</span>
            <span>{formatIDR(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatIDR(order.total)}</span>
          </div>
        </div>
      </div>

      {["waiting_payment", "pending"].includes(order.status) && (
        <div className="no-print mt-6 flex flex-wrap gap-3">
          <RetryPayment orderId={order.id} />
          <Button asChild variant="outline">
            <Link href="/checkout">Buat Pesanan Baru</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
