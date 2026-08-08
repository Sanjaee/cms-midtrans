"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Home, Check } from "lucide-react";
import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string | null;
  line1: string;
  city: string;
  province: string;
  postalCode: string | null;
  isDefault: boolean;
}

const PROVINCES = [
  "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DI Yogyakarta",
  "Banten", "Bali", "Lainnya",
];

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [adding, setAdding] = React.useState(addresses.length === 0);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await addAddressAction({
      label: form.get("label")?.toString(),
      name: form.get("name")?.toString() || "",
      phone: form.get("phone")?.toString(),
      line1: form.get("line1")?.toString() || "",
      city: form.get("city")?.toString() || "",
      province: form.get("province")?.toString() || "",
      postalCode: form.get("postalCode")?.toString(),
      isDefault: form.get("isDefault") === "on",
    });
    setLoading(false);
    toast.success(res?.success || "Alamat ditambahkan");
    setAdding(false);
    router.refresh();
  };

  const remove = async (id: string) => {
    await deleteAddressAction(id);
    toast.success("Alamat dihapus");
    router.refresh();
  };

  const makeDefault = async (id: string) => {
    await setDefaultAddressAction(id);
    toast.success("Alamat utama diubah");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alamat Saya</h1>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          + Tambah Alamat
        </Button>
      </div>

      {adding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tambah Alamat Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" placeholder="Rumah / Kantor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Penerima</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi</Label>
                <select
                  id="province"
                  name="province"
                  required
                  className="flex h-10 w-full rounded-lg border border-input bg-card/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
                >
                  <option value="">Pilih</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line1">Alamat Lengkap</Label>
                <Input id="line1" name="line1" placeholder="Jalan, nomor, RT/RW" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Kota/Kabupaten</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kode Pos</Label>
                <Input id="postalCode" name="postalCode" />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="isDefault" className="h-4 w-4 accent-primary" />
                Jadikan alamat utama
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Alamat
                </Button>
                <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {addresses.map((a) => (
        <div
          key={a.id}
          className={cn(
            "rounded-2xl border bg-card p-5 shadow-sm",
            a.isDefault && "border-primary/50",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.label}</p>
                  {a.isDefault && (
                    <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" /> Utama
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{a.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {a.line1}, {a.city}, {a.province} {a.postalCode}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!a.isDefault && (
                <Button size="sm" variant="outline" onClick={() => makeDefault(a.id)}>
                  Jadikan Utama
                </Button>
              )}
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => remove(a.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
