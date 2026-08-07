import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, orders, wishlists, reviews, sessions, products, orderItems } from "@/db/schema";
import { formatIDR, formatDate, formatDateTime } from "@/lib/utils";
import { statusLabel, statusColor } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Detail Pelanggan" };

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) notFound();

  const [orderRows, wishlistRows, reviewRows, sessionRows, totalRow] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt)),
    db
      .select({ productId: wishlists.productId, name: products.name, slug: products.slug, thumbnail: products.thumbnail, price: products.price })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, id)),
    db.select().from(reviews).where(eq(reviews.userId, id)).orderBy(desc(reviews.createdAt)),
    db.select().from(sessions).where(eq(sessions.userId, id)).orderBy(desc(sessions.lastActivityAt)).limit(10),
    db
      .select({ value: sql<number>`COALESCE(SUM(${orders.total}), 0)` })
      .from(orders)
      .where(sql`${orders.userId} = ${id} AND ${orders.paymentStatus} = 'paid'`),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email} · {user.phone || "no phone"}</p>
            <p className="text-xs text-muted-foreground">Bergabung {formatDate(user.createdAt)}</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-lg font-bold">{orderRows.length}</p>
              <p className="text-xs text-muted-foreground">Pesanan</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatIDR(totalRow?.[0]?.value || 0)}</p>
              <p className="text-xs text-muted-foreground">Total Belanja</p>
            </div>
            <div>
              <p className="text-lg font-bold">{wishlistRows.length}</p>
              <p className="text-xs text-muted-foreground">Wishlist</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Riwayat Pesanan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {orderRows.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatIDR(o.total)}</span>
                  <Badge className={statusColor(o.status)}>{statusLabel(o.status)}</Badge>
                </div>
              </Link>
            ))}
            {!orderRows.length && <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Wishlist</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {wishlistRows.map((w) => (
              <Link key={w.productId} href={`/products/${w.slug}`} className="flex items-center gap-3 text-sm hover:text-primary">
                <span className="font-medium">{w.name}</span>
                <span className="ml-auto text-muted-foreground">{formatIDR(w.price || 0)}</span>
              </Link>
            ))}
            {!wishlistRows.length && <p className="text-sm text-muted-foreground">Wishlist kosong.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Review</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reviewRows.map((r) => (
              <div key={r.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Rating value={r.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
            {!reviewRows.length && <p className="text-sm text-muted-foreground">Belum ada review.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Aktivitas Login</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sessionRows.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {s.ip || "-"} · {s.userAgent?.slice(0, 40) || "-"}
                </span>
                <span className="text-xs text-muted-foreground">{formatDateTime(s.lastActivityAt)}</span>
              </div>
            ))}
            {!sessionRows.length && <p className="text-sm text-muted-foreground">Belum ada aktivitas login.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
