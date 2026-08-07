import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { formatIDR, formatDate } from "@/lib/utils";
import { statusLabel, statusColor } from "@/lib/order-status";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Pesanan Saya" };

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getSession();
  if (!user) return null;

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Pesanan Saya</h1>
      <p className="text-sm text-muted-foreground">
        Riwayat dan status pesanan Anda.
      </p>

      <div className="mt-6 space-y-4">
        {!rows.length && (
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="Belum ada pesanan"
            description="Anda belum memiliki pesanan. Mulai belanja sekarang!"
            action={
              <Link href="/products" className="text-sm font-semibold text-primary underline">
                Belanja Sekarang
              </Link>
            }
          />
        )}
        {rows.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 soft-shadow transition-all hover:shadow-lg"
          >
            <div>
              <p className="font-semibold">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">
                {formatIDR(order.total)}
              </span>
              <Badge className={statusColor(order.status)}>
                {statusLabel(order.status)}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
