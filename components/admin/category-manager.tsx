"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Upload } from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  banner: string | null;
  sortOrder: number;
  active: boolean;
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    banner: "",
    sortOrder: 0,
    active: true,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", image: "", banner: "", sortOrder: 0, active: true });
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image: c.image || "",
      banner: c.banner || "",
      sortOrder: c.sortOrder,
      active: c.active,
    });
    setOpen(true);
  };

  const submit = async () => {
    setLoading(true);
    const res = editing
      ? await updateCategoryAction(editing.id, form)
      : await createCategoryAction(form);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal");
    }
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "uploads/categories");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      set(field, data.url);
      toast.success("Gambar diupload");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategori</h1>
          <p className="text-sm text-muted-foreground">Kelola kategori produk.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {c.image && (
                      <Image src={c.image} alt={c.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" unoptimized />
                    )}
                    <span className="font-medium">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-sm">{c.sortOrder}</TableCell>
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
                    <DeleteButton action={() => deleteCategoryAction(c.id)} />
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
            <DialogTitle>{editing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Gambar Kategori</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("cat-img")?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </Button>
                  <input id="cat-img" type="file" className="hidden" onChange={(e) => upload(e, "image")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Banner</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("cat-banner")?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </Button>
                  <input id="cat-banner" type="file" className="hidden" onChange={(e) => upload(e, "banner")} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-3">
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </div>
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
