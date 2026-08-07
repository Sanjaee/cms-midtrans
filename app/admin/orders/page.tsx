import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatIDR, formatDate } from "@/lib/utils";
import { statusLabel, statusColor } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OrderStatusFilter } from "@/components/admin/order-status-filter";

export const metadata: Metadata = { title: "Manajemen Pesanan" };

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const conditions = [];
  if (sp.status && sp.status !== "all") {
    conditions.push(eq(orders.status, sp.status as never));
  }
  if (sp.q) {
    conditions.push(
      sql`(${orders.orderNumber} ILIKE ${`%${sp.q}%`} OR ${orders.customerName} ILIKE ${`%${sp.q}%`})`,
    );
  }

  const rows = conditions.length
    ? await db.select().from(orders).where(sql.join(conditions, sql` AND `)).orderBy(desc(orders.createdAt))
    : await db.select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <p className="text-sm text-muted-foreground">Kelola semua pesanan toko.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex gap-2" action="/admin/orders">
          <input
            name="q"
            placeholder="Cari nomor / nama..."
            defaultValue={sp.q}
            className="h-10 w-64 rounded-lg border border-input bg-card px-3 text-sm"
          />
          <Button variant="outline" type="submit">Cari</Button>
        </form>
        <OrderStatusFilter currentStatus={sp.status || "all"} query={sp.q} />
      </div>

      <div className="rounded-2xl border bg-card soft-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">
                    {o.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  <p>{o.customerName}</p>
                  <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                <TableCell className="font-semibold">{formatIDR(o.total)}</TableCell>
                <TableCell className="text-sm">{o.paymentMethod || "-"}</TableCell>
                <TableCell>
                  <Badge className={statusColor(o.status)}>{statusLabel(o.status)}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6} className="p-10 text-center text-muted-foreground">
                  Tidak ada pesanan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
