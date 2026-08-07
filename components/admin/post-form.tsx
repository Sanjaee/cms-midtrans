"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { createPostAction, updatePostAction } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PostFormProps {
  post?: PostData;
  categories: { id: string; name: string }[];
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  categoryId: string | null;
  status: string;
  featured: boolean;
  publishedAt: Date | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
}

export function PostForm({ post, categories }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>(post?.tags || []);

  const [form, setForm] = React.useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    thumbnail: post?.thumbnail || "",
    categoryId: post?.categoryId || "",
    status: post?.status || "draft",
    featured: post?.featured || false,
    publishedAt: post?.publishedAt
      ? new Date(post.publishedAt).toISOString().slice(0, 16)
      : "",
    seoTitle: post?.seoTitle || "",
    seoDescription: post?.seoDescription || "",
    seoKeywords: post?.seoKeywords || "",
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "uploads/blog");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      set("thumbnail", data.url);
      toast.success("Gambar diupload");
    }
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value.trim();
    if (e.key === "Enter" && val) {
      e.preventDefault();
      if (!tags.includes(val)) setTags([...tags, val]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt,
      content: form.content,
      thumbnail: form.thumbnail,
      categoryId: form.categoryId || null,
      tags,
      status: form.status,
      featured: form.featured,
      publishedAt: form.publishedAt || undefined,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
    };
    const res = post
      ? await updatePostAction(post.id, payload)
      : await createPostAction(payload);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      router.push("/admin/blog");
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
            <CardHeader><CardTitle className="text-base">Konten Artikel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Judul *</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ringkasan (Excerpt)</Label>
                <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Isi Artikel (HTML didukung)</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  rows={18}
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2"><Label>SEO Title</Label><Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></div>
              <div className="space-y-2"><Label>SEO Description</Label><Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={3} /></div>
              <div className="space-y-2"><Label>SEO Keywords</Label><Input value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Pengaturan</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Publish</SelectItem>
                    <SelectItem value="scheduled">Jadwalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal Publish</Label>
                <Input type="datetime-local" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tags (Enter untuk tambah)</Label>
                <Input onKeyDown={addTag} placeholder="tips, tutorial, ..." />
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                Artikel Unggulan
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Thumbnail</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-28 overflow-hidden rounded-lg border bg-muted">
                  {form.thumbnail ? (
                    <Image src={form.thumbnail} alt="thumb" fill className="object-cover" unoptimized />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-muted-foreground">Kosong</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById("post-thumb")?.click()}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload
                </Button>
                <input id="post-thumb" type="file" accept="image/*" className="hidden" onChange={upload} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {post ? "Simpan Perubahan" : "Buat Artikel"}
          </Button>
        </div>
      </div>
    </form>
  );
}
