"use server";

import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { requireUser, getSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Review minimal 10 karakter"),
});

export async function createReviewAction(
  prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const user = await getSession();
  if (!user) return { error: "Silakan login untuk memberikan review" };

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { productId, rating, title, comment } = parsed.data;

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId));
  if (!product) return { error: "Produk tidak ditemukan" };

  await db.insert(reviews).values({
    id: generateId(),
    productId,
    userId: user.id,
    rating,
    title,
    comment,
  });

  await recalcRating(productId);

  return { success: "Review berhasil dikirim. Terima kasih!" };
}

export async function recalcRating(productId: string) {
  const [row] = await db
    .select({
      avg: sql<number>`ROUND(AVG(rating)::numeric, 2)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));
  await db
    .update(products)
    .set({
      rating: String(row?.avg || 0),
      ratingCount: Number(row?.count || 0),
    })
    .where(eq(products.id, productId));
}

export async function likeReviewAction(reviewId: string) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };
  await db
    .update(reviews)
    .set({ helpful: sql`${reviews.helpful} + 1` })
    .where(eq(reviews.id, reviewId));
  return { ok: true };
}
