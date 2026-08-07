import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { formatIDR, formatDate } from "@/lib/utils";
import { toggleUserStatusAction } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/action-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Manajemen Pelanggan" };

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      phone: users.phone,
      status: users.status,
      createdAt: users.createdAt,
      totalSpend: sql<number>`COALESCE((
        SELECT SUM(${orders.total}) FROM ${orders}
        WHERE ${orders.userId} = ${users.id} AND ${orders.paymentStatus} = 'paid'
      ), 0)`,
      orderCount: sql<number>`COALESCE((
        SELECT COUNT(*) FROM ${orders}
        WHERE ${orders.userId} = ${users.id}
      ), 0)`,
    })
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pelanggan</h1>
        <p className="text-sm text-muted-foreground">Kelola data pelanggan toko.</p>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Total Belanja</TableHead>
              <TableHead>Pesanan</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.avatar || undefined} />
                      <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/admin/customers/${u.id}`} className="font-medium hover:text-primary hover:underline">
                        {u.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">{formatIDR(u.totalSpend)}</TableCell>
                <TableCell className="text-sm">{u.orderCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={u.status === "active" ? "success" : "destructive"}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/customers/${u.id}`}>Detail</Link>
                    </Button>
                    <ActionButton
                      variant={u.status === "active" ? "outline" : "destructive"}
                      size="sm"
                      action={toggleUserStatusAction.bind(null, u.id)}
                    >
                      {u.status === "active" ? "Suspend" : "Aktifkan"}
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
