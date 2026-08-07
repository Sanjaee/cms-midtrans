"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createFaqAction, deleteFaqAction } from "@/lib/admin-actions";
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
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}

export function FaqManager({ items }: { items: Faq[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ question: "", answer: "" });

  const submit = async () => {
    setLoading(true);
    const res = await createFaqAction(form);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      setOpen(false);
      setForm({ question: "", answer: "" });
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQ</h1>
          <p className="text-sm text-muted-foreground">Kelola pertanyaan yang sering diajukan.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Tambah FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id} className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <HelpCircle className="h-4 w-4 text-primary" /> {f.question}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
            </div>
            <DeleteButton action={() => deleteFaqAction(f.id)} />
          </div>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">Belum ada FAQ.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah FAQ</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pertanyaan</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Jawaban</Label>
              <Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
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
