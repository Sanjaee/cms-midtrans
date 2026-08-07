"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Upload } from "lucide-react";
import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
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
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  type: "hero" | "promo" | "slider";
  imageDesktop: string | null;
  imageMobile: string | null;
  link: string | null;
  active: boolean;
  sortOrder: number;
}

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Banner | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    subtitle: "",
    type: "promo" as "hero" | "promo" | "slider",
    imageDesktop: "",
    imageMobile: "",
    link: "",
    active: true,
    sortOrder: 0,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", type: "promo", imageDesktop: "", imageMobile: "", link: "", active: true, sortOrder: 0 });
    setOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      type: b.type,
      imageDesktop: b.imageDesktop || "",
      imageMobile: b.imageMobile || "",
      link: b.link || "",
      active: b.active,
      sortOrder: b.sortOrder,
    });
    setOpen(true);
  };

  const submit = async () => {
    setLoading(true);
    const res = editing
      ? await updateBannerAction(editing.id, form)
      : await createBannerAction(form);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal");
    }
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, field: "imageDesktop" | "imageMobile") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "uploads/banners");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      set(field, data.url);
      toast.success("Gambar diupload");
    }
  };

  const typeLabel: Record<string, string> = { hero: "Hero", promo: "Promo", slider: "Slider" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banner</h1>
          <p className="text-sm text-muted-foreground">Kelola banner toko.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Tambah Banner
        </Button>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banner</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {b.imageDesktop && (
                      <Image src={b.imageDesktop} alt={b.title} width={60} height={32} className="h-8 w-15 rounded object-cover" unoptimized />
                    )}
                    <div>
                      <p className="font-medium">{b.title}</p>
                      {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{typeLabel[b.type]}</Badge></TableCell>
                <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">{b.link || "-"}</TableCell>
                <TableCell>
                  <Badge variant={b.active ? "success" : "secondary"}>{b.active ? "Aktif" : "Nonaktif"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <DeleteButton action={() => deleteBannerAction(b.id)} />
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
            <DialogTitle>{editing ? "Edit Banner" : "Tambah Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Subjudul</Label>
              <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                    <SelectItem value="slider">Slider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="/products atau URL" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Gambar Desktop</Label>
                <Button variant="outline" size="sm" onClick={() => document.getElementById("ban-desktop")?.click()}>
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
                <input id="ban-desktop" type="file" className="hidden" onChange={(e) => upload(e, "imageDesktop")} />
              </div>
              <div className="space-y-2">
                <Label>Gambar Mobile</Label>
                <Button variant="outline" size="sm" onClick={() => document.getElementById("ban-mobile")?.click()}>
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
                <input id="ban-mobile" type="file" className="hidden" onChange={(e) => upload(e, "imageMobile")} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
              Aktif
            </label>
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
