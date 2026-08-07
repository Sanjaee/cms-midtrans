"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createTestimonialAction, deleteTestimonialAction } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rating } from "@/components/ui/rating";
import { Quote } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  productName: string | null;
}

export function TestimonialManager({ items }: { items: Testimonial[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    productName: "",
  });

  const submit = async () => {
    setLoading(true);
    const res = await createTestimonialAction(form);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      setOpen(false);
      setForm({ name: "", role: "", content: "", rating: 5, productName: "" });
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimoni</h1>
          <p className="text-sm text-muted-foreground">Kelola testimoni pelanggan.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <div key={t.id} className="rounded-2xl border bg-card p-5 soft-shadow">
            <Quote className="h-5 w-5 text-primary/40" />
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              &ldquo;{t.content}&rdquo;
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role || t.productName}</p>
              </div>
              <Rating value={t.rating} size="sm" />
            </div>
            <div className="mt-3">
              <DeleteButton action={() => deleteTestimonialAction(t.id)} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Testimoni</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Peran / Produk</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Isi Testimoni</Label>
              <Textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })} className="text-xl">
                    {r <= form.rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={submit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
