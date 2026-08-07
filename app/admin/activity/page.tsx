import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
import { timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Audit Log" };

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const rows = await db
    .select({ log: activityLogs, userName: users.name })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Riwayat aktivitas sistem dan pengguna.</p>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entitas</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.log.id}>
                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                  {timeAgo(r.log.createdAt)}
                </TableCell>
                <TableCell className="text-sm">{r.userName || "Anonim"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{r.log.action}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.log.entity || "-"} {r.log.entityId ? `(${r.log.entityId.slice(0, 8)}...)` : ""}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.log.ip || "-"}</TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} className="p-10 text-center text-muted-foreground">
                  Belum ada aktivitas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
