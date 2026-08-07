"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateOrderStatusAction } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = [
  "pending",
  "waiting_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
] as const;

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentTracking,
}: {
  orderId: string;
  currentStatus: string;
  currentTracking?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState(currentStatus);
  const [tracking, setTracking] = React.useState(currentTracking || "");
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await updateOrderStatusAction(orderId, status, tracking);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal memperbarui");
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="font-semibold">Update Status</h3>
      <div className="mt-4 space-y-3">
        <div className="space-y-2">
          <Label>Status Pesanan</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nomor Resi</Label>
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="cth: JNE123456789" />
        </div>
        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
