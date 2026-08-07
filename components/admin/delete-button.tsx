"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function DeleteButton({
  action,
  label = "Hapus",
  confirmTitle = "Yakin ingin menghapus?",
  confirmText = "Tindakan ini tidak dapat dibatalkan.",
  variant = "destructive",
}: {
  action: () => Promise<{ error?: string; success?: string }>;
  label?: string;
  confirmTitle?: string;
  confirmText?: string;
  variant?: "destructive" | "ghost" | "outline";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const run = async () => {
    setLoading(true);
    const res = await action();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={variant === "ghost" ? "text-destructive" : ""}
        >
          <Trash2 className="h-3.5 w-3.5" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmTitle}</DialogTitle>
          <DialogDescription>{confirmText}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={run} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Ya, Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
