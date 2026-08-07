"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { replyReviewAction } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ReplyForm({
  reviewId,
  currentReply,
}: {
  reviewId: string;
  currentReply: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(Boolean(currentReply));
  const [reply, setReply] = React.useState(currentReply);
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await replyReviewAction(reviewId, reply);
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
    <div className="flex items-center gap-2">
      {open ? (
        <>
          <Input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Tulis balasan..."
            className="h-9 w-64"
          />
          <Button size="sm" onClick={submit} disabled={loading}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Kirim
          </Button>
        </>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <MessageSquare className="h-3.5 w-3.5" /> Balas
        </Button>
      )}
    </div>
  );
}
