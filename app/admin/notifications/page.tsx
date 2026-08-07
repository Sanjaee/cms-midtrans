import type { Metadata } from "next";
import { desc, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { timeAgo } from "@/lib/utils";
import { createNotificationAction, markNotificationReadAction } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = { title: "Pusat Notifikasi" };

export const dynamic = "force-dynamic";

const typeColors: Record<string, "info" | "warning" | "success" | "secondary" | "destructive"> = {
  order: "info",
  payment: "success",
  shipping: "warning",
  promo: "destructive",
  system: "secondary",
};

export default async function AdminNotificationsPage() {
  const rows = await db
    .select()
    .from(notifications)
    .where(isNull(notifications.userId))
    .orderBy(desc(notifications.createdAt));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="mb-6 text-2xl font-bold">Pusat Notifikasi</h1>
        <div className="space-y-3">
          {rows.map((n) => (
            <div
              key={n.id}
              className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-4 soft-shadow"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={typeColors[n.type] || "secondary"}>{n.type}</Badge>
                  <p className="font-semibold">{n.title}</p>
                </div>
                {n.message && <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
              </div>
              <ActionButton action={markNotificationReadAction.bind(null, n.id)}>
                Tandai dibaca
              </ActionButton>
            </div>
          ))}
          {!rows.length && <p className="text-sm text-muted-foreground">Belum ada notifikasi.</p>}
        </div>
      </div>

      <div>
        <h1 className="mb-6 text-2xl font-bold">Kirim Notifikasi</h1>
        <Card>
          <CardHeader><CardTitle className="text-base">Notifikasi Baru</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              action={async (formData) => {
                "use server";
                await createNotificationAction({
                  title: formData.get("title")?.toString() || "",
                  message: formData.get("message")?.toString(),
                  type: (formData.get("type") as never) || "system",
                });
              }}
            >
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <Label>Pesan</Label>
                <Textarea name="message" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <select name="type" className="flex h-10 w-full rounded-lg border border-input bg-card/40 px-3 text-sm">
                  <option value="system">System</option>
                  <option value="promo">Promo</option>
                  <option value="shipping">Shipping</option>
                  <option value="order">Order</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <Button className="w-full">
                <Send className="h-4 w-4" /> Kirim
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
