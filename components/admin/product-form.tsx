"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  Upload,
  Bold,
  Italic,
  List,
  Heading2,
  Link as LinkIcon,
} from "lucide-react";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  product?: ProductData;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  categoryId: string | null;
  brand: string | null;
  price: number;
  salePrice: number | null;
  discountPct: number;
  isFlashSale: boolean;
  flashSaleEndsAt: Date | null;
  stock: number;
  weight: number;
  shortDescription: string | null;
  longDescription: string | null;
  thumbnail: string | null;
  images: string[];
  video: string | null;
  badge: string;
  status: string;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  specs: Record<string, string> | null;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [form, setForm] = React.useState({
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || "",
    brand: product?.brand || "",
    price: product?.price || "",
    salePrice: product?.salePrice || "",
    discountPct: product?.discountPct || "",
    isFlashSale: product?.isFlashSale || false,
    flashSaleEndsAt: product?.flashSaleEndsAt
      ? new Date(product.flashSaleEndsAt).toISOString().slice(0, 16)
      : "",
    stock: product?.stock ?? "",
    weight: product?.weight ?? "",
    shortDescription: product?.shortDescription || "",
    longDescription: product?.longDescription || "",
    thumbnail: product?.thumbnail || "",
    images: product?.images || [],
    video: product?.video || "",
    badge: product?.badge || "none",
    status: product?.status || "draft",
    featured: product?.featured || false,
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
    seoKeywords: product?.seoKeywords || "",
  });

  const [specs, setSpecs] = React.useState<[string, string][]>(
    Object.entries(product?.specs || {}) as [string, string][],
  );

  const set = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const uploadFile = async (file: File, multi: boolean) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "uploads/products");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      if (multi) {
        set("images", [...form.images, data.url]);
        if (!form.thumbnail) set("thumbnail", data.url);
      } else {
        set("thumbnail", data.url);
      }
      toast.success("File berhasil diupload");
    } else {
      toast.error(data.error || "Upload gagal");
    }
  };

  const insertFormat = (before: string, after = "") => {
    set(
      "longDescription",
      `${form.longDescription}${before}${after}`,
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const specsObj: Record<string, string> = {};
    for (const [k, v] of specs) if (k && v) specsObj[k] = v;

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      sku: form.sku,
      categoryId: form.categoryId || null,
      brand: form.brand,
      shortDescription: form.shortDescription,
      longDescription: form.longDescription,
      specs: specsObj,
      price: Number(form.price) || 0,
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      discountPct: form.discountPct ? Number(form.discountPct) : undefined,
      isFlashSale: form.isFlashSale,
      flashSaleEndsAt: form.flashSaleEndsAt || undefined,
      stock: Number(form.stock) || 0,
      weight: Number(form.weight) || 0,
      thumbnail: form.thumbnail,
      images: form.images,
      video: form.video,
      badge: form.badge,
      status: form.status,
      featured: form.featured,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
    };

    const res = product
      ? await updateProductAction(product.id, payload)
      : await createProductAction(payload);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nama Produk *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="otomatis dari nama"
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => set("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Singkat</Label>
                <Textarea
                  value={form.shortDescription}
                  onChange={(e) => set("shortDescription", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Berat (gram)</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => set("weight", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Harga & Promo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Harga Asli (Rp)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Diskon (Rp)</Label>
                <Input
                  type="number"
                  value={form.salePrice}
                  onChange={(e) => set("salePrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Persentase Diskon (%)</Label>
                <Input
                  type="number"
                  value={form.discountPct}
                  onChange={(e) => set("discountPct", e.target.value)}
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.isFlashSale}
                    onCheckedChange={(v) => set("isFlashSale", v)}
                  />
                  Flash Sale
                </label>
                {form.isFlashSale && (
                  <Input
                    type="datetime-local"
                    value={form.flashSaleEndsAt}
                    onChange={(e) => set("flashSaleEndsAt", e.target.value)}
                    className="flex-1"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Select value={form.badge} onValueChange={(v) => set("badge", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Badge</SelectItem>
                    <SelectItem value="best_seller">Best Seller</SelectItem>
                    <SelectItem value="new">Baru</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Publish</SelectItem>
                    <SelectItem value="archived">Arsip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(v) => set("featured", v)}
                  />
                  Produk Unggulan
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deskripsi Lengkap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex gap-1">
                {[
                  { icon: Bold, label: "B", fn: () => insertFormat("<strong>", "</strong>") },
                  { icon: Italic, label: "I", fn: () => insertFormat("<em>", "</em>") },
                  { icon: Heading2, label: "H2", fn: () => insertFormat("<h2>", "</h2>") },
                  { icon: List, label: "List", fn: () => insertFormat("<li>", "</li>") },
                  { icon: LinkIcon, label: "Link", fn: () => insertFormat("<a href=''>", "</a>") },
                ].map((b) => (
                  <Button
                    key={b.label}
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={b.fn}
                  >
                    <b.icon className="h-3.5 w-3.5" />
                  </Button>
                ))}
              </div>
              <Textarea
                value={form.longDescription}
                onChange={(e) => set("longDescription", e.target.value)}
                rows={10}
                placeholder="Deskripsi lengkap produk (HTML didukung)"
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Spesifikasi</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSpecs([...specs, ["", ""]])}
              >
                <Plus className="h-3.5 w-3.5" /> Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {specs.map(([k, v], i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Nama (cth: Bahan)"
                    value={k}
                    onChange={(e) => {
                      const next = [...specs];
                      next[i][0] = e.target.value;
                      setSpecs(next);
                    }}
                  />
                  <Input
                    placeholder="Nilai (cth: Katun premium)"
                    value={v}
                    onChange={(e) => {
                      const next = [...specs];
                      next[i][1] = e.target.value;
                      setSpecs(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Thumbnail</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                    {form.thumbnail ? (
                      <Image src={form.thumbnail} alt="thumb" fill className="object-cover" unoptimized />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Kosong
                      </span>
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById("thumb-input")?.click()}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload
                    </Button>
                    <input
                      id="thumb-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], false)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Gallery</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {form.images.map((img: string, i: number) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border">
                      <Image src={img} alt="" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex"
                        onClick={() => set("images", form.images.filter((_: string, idx: number) => idx !== i))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => document.getElementById("gallery-input")?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                    Tambah
                  </button>
                  <input
                    id="gallery-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      Array.from(e.target.files || []).forEach((f) => uploadFile(f, true))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={form.video}
                  onChange={(e) => set("video", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <Input value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} placeholder="dipisah koma" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {product ? "Simpan Perubahan" : "Buat Produk"}
          </Button>
        </div>
      </div>
    </form>
  );
}
