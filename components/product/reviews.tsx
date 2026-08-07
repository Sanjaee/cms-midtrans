"use client";

import * as React from "react";
import { useActionState } from "react";
import Image from "next/image";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { createReviewAction, likeReviewAction } from "@/lib/review-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertSuccess } from "@/components/ui/alert";
import { formatDate, cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  photos: string[];
  video: string | null;
  helpful: number;
  adminReply: string | null;
  createdAt: string;
  user?: { name: string; avatar: string | null };
}

export function ReviewsSection({
  productId,
  reviews,
  isLoggedIn,
}: {
  productId: string;
  reviews: Review[];
  isLoggedIn: boolean;
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [state, action, pending] = useActionState(createReviewAction, {});

  const avg =
    reviews.length
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <p className="text-4xl font-bold">{avg.toFixed(1)}</p>
        <div className="mt-2 flex justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.round(avg)
                  ? "fill-foreground text-foreground"
                  : "text-muted-foreground/40",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {reviews.length} ulasan
        </p>
        {isLoggedIn && !showForm && (
          <Button
            className="mt-4 w-full"
            onClick={() => setShowForm(true)}
          >
            Tulis Ulasan
          </Button>
        )}
        {!isLoggedIn && (
          <p className="mt-4 text-xs text-muted-foreground">
            Login untuk menulis ulasan
          </p>
        )}
      </div>

      <div>
        {showForm && (
          <form
            action={action}
            className="mb-6 rounded-2xl border bg-card p-5 shadow-sm"
          >
            <input type="hidden" name="productId" value={productId} />
            <h4 className="font-semibold">Tulis Ulasan Anda</h4>
            {state.error && (
              <Alert variant="destructive" className="mt-3">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            {state.success && (
              <div className="mt-3">
                <AlertSuccess>{state.success}</AlertSuccess>
              </div>
            )}
            <div className="mt-4 space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <label key={r} className="cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={r}
                      defaultChecked={r === 5}
                      className="peer sr-only"
                    />
                    <Star className="h-6 w-6 text-muted-foreground/40 transition-colors peer-checked:fill-foreground peer-checked:text-foreground" />
                  </label>
                ))}
              </div>
              <Input name="title" placeholder="Judul ulasan (opsional)" />
              <Textarea
                name="comment"
                placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                minLength={10}
                required
              />
              <Button type="submit" disabled={pending}>
                {pending ? "Mengirim..." : "Kirim Ulasan"}
              </Button>
            </div>
          </form>
        )}

        {!reviews.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Belum ada ulasan. Jadilah yang pertama!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={r.user?.avatar || undefined} />
                      <AvatarFallback>
                        {(r.user?.name || "U").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">
                        {r.user?.name || "Pelanggan"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < r.rating
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground/40",
                        )}
                      />
                    ))}
                  </div>
                </div>
                {r.title && (
                  <h5 className="mt-3 font-semibold">{r.title}</h5>
                )}
                {r.comment && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {r.comment}
                  </p>
                )}
                {r.photos?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.photos.map((p, i) => (
                      <Image
                        key={i}
                        src={p}
                        alt="review photo"
                        width={72}
                        height={72}
                        className="h-18 w-18 rounded-lg object-cover"
                        unoptimized
                      />
                    ))}
                  </div>
                )}
                {r.adminReply && (
                  <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                    <p className="flex items-center gap-1 text-xs font-semibold">
                      <MessageSquare className="h-3 w-3" /> Balasan Admin
                    </p>
                    <p className="mt-1 text-muted-foreground">{r.adminReply}</p>
                  </div>
                )}
                <button
                  onClick={() => likeReviewAction(r.id)}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Membantu (
                  {r.helpful || 0})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
