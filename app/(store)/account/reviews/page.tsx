import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { EmptyState } from "@/components/ui/empty-state";
import { Star } from "lucide-react";

export const metadata: Metadata = { title: "Ulasan Saya" };

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const user = await getSession();
  if (!user) return null;

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      productId: products.id,
      productName: products.name,
      productImage: products.thumbnail,
      productSlug: products.slug,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Ulasan Saya</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Semua ulasan yang pernah Anda tulis.
      </p>

      {!rows.length && (
        <EmptyState
          icon={<Star className="h-6 w-6" />}
          title="Belum ada ulasan"
          description="Anda belum menulis ulasan produk."
          action={
            <Link href="/products" className="text-sm font-semibold text-primary underline">
              Belanja dan beri ulasan
            </Link>
          }
        />
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-card p-5 soft-shadow">
            <div className="flex items-start justify-between gap-4">
              <Link href={`/products/${r.productSlug || ""}`} className="flex items-center gap-3">
                <Image
                  src={r.productImage || "/placeholders/1.svg"}
                  alt={r.productName || "Produk"}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-cover"
                  unoptimized
                />
                <div>
                  <p className="line-clamp-1 text-sm font-semibold hover:text-primary">
                    {r.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </p>
                </div>
              </Link>
              <Rating value={r.rating} size="sm" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
