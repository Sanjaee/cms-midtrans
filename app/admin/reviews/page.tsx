import type { Metadata } from "next";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews, products, users } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { approveReviewAction, replyReviewAction } from "@/lib/admin-actions";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/admin/action-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReplyForm } from "@/components/admin/reply-form";
import { Check, X } from "lucide-react";

export const metadata: Metadata = { title: "Review Produk" };

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      photos: reviews.photos,
      adminReply: reviews.adminReply,
      approved: reviews.approved,
      createdAt: reviews.createdAt,
      userName: users.name,
      userAvatar: users.avatar,
      productName: products.name,
      productImage: products.thumbnail,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Produk</h1>
        <p className="text-sm text-muted-foreground">Kelola ulasan pelanggan.</p>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-card p-5 soft-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={r.userAvatar || undefined} />
                  <AvatarFallback>{(r.userName || "U").slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{r.userName || "Pelanggan"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.productName || "-"} · {formatDate(r.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Rating value={r.rating} size="sm" />
                <Badge variant={r.approved ? "success" : "warning"}>
                  {r.approved ? "Disetujui" : "Menunggu"}
                </Badge>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>

            {r.photos?.length > 0 && (
              <div className="mt-3 flex gap-2">
                {r.photos.map((p, i) => (
                  <Image key={i} src={p} alt="" width={56} height={56} className="h-14 w-14 rounded-lg object-cover" unoptimized />
                ))}
              </div>
            )}

            {r.adminReply && (
              <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                <p className="text-xs font-semibold">Balasan Admin</p>
                <p className="mt-1 text-muted-foreground">{r.adminReply}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ReplyForm reviewId={r.id} currentReply={r.adminReply || ""} />
              {!r.approved && (
                <ActionButton
                  variant="outline"
                  size="sm"
                  action={approveReviewAction.bind(null, r.id, true)}
                >
                  <Check className="h-3.5 w-3.5" /> Setujui
                </ActionButton>
              )}
              {r.approved && (
                <ActionButton
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  action={approveReviewAction.bind(null, r.id, false)}
                >
                  <X className="h-3.5 w-3.5" /> Tolak
                </ActionButton>
              )}
            </div>
          </div>
        ))}
        {!rows.length && <p className="text-sm text-muted-foreground">Belum ada review.</p>}
      </div>
    </div>
  );
}
