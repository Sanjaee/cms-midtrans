"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
} from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIDR, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  maxDiscount: number | null;
  expiresAt: string | null;
  quota: number | null;
  used: number;
  autoApply: boolean;
  freeShipping: boolean;
  active: boolean;
}

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coupon | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 10,
    minSpend: 0,
    maxDiscount: "",
    expiresAt: "",
    quota: "",
    autoApply: false,
    freeShipping: false,
    active: true,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setEditing(null);
    setForm({ code: "", type: "percent", value: 10, minSpend: 0, maxDiscount: "", expiresAt: "", quota: "", autoApply: false, freeShipping: false, active: true });
    setOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minSpend: c.minSpend,
      maxDiscount: c.maxDiscount?.toString() || "",
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "",
      quota: c.quota?.toString() || "",
      autoApply: c.autoApply,
      freeShipping: c.freeShipping,
      active: c.active,
    });
    setOpen(true);
  };

  const submit = async () => {
    setLoading(true);
    const payload = {
      ...form,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      quota: form.quota ? Number(form.quota) : null,
      expiresAt: form.expiresAt || undefined,
    };
    const res = editing
      ? await updateCouponAction(editing.id, payload)
      : await createCouponAction(payload);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kupon & Diskon</h1>
          <p className="text-sm text-muted-foreground">Kelola voucher dan promo diskon.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Tambah Kupon
        </Button>
      </div>

      <div className="rounded-2xl border bg-card soft-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Min Belanja</TableHead>
              <TableHead>Terpakai</TableHead>
              <TableHead>Kedaluwarsa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                <TableCell>
                  {c.type === "percent" ? `${c.value}%` : formatIDR(c.value)}
                  {c.freeShipping && <Badge variant="info" className="ml-2">Gratis Ongkir</Badge>}
                </TableCell>
                <TableCell className="text-sm">{formatIDR(c.minSpend)}</TableCell>
                <TableCell className="text-sm">{c.used}/{c.quota ?? "∞"}</TableCell>
                <TableCell className="text-sm">{c.expiresAt ? formatDate(c.expiresAt) : "-"}</TableCell>
                <TableCell>
                  <Badge variant={c.active ? "success" : "secondary"}>
                    {c.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <DeleteButton action={() => deleteCouponAction(c.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kupon" : "Tambah Kupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kode Kupon</Label>
                <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{form.type === "percent" ? "Nilai (%)" : "Nilai (Rp)"}</Label>
                <Input type="number" value={form.value} onChange={(e) => set("value", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Min. Belanja (Rp)</Label>
                <Input type="number" value={form.minSpend} onChange={(e) => set("minSpend", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Maks. Diskon (Rp)</Label>
                <Input type="number" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kuota</Label>
                <Input type="number" value={form.quota} onChange={(e) => set("quota", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kedaluwarsa</Label>
                <Input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.autoApply} onCheckedChange={(v) => set("autoApply", v)} />
                Auto Apply
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.freeShipping} onCheckedChange={(v) => set("freeShipping", v)} />
                Gratis Ongkir
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
                Aktif
              </label>
            </div>
            <Button className="w-full" onClick={submit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Simpan" : "Buat"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
