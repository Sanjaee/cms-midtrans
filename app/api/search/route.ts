import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, posts, categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) {
    return NextResponse.json({ products: [], posts: [], categories: [] });
  }
  const pattern = `%${q}%`;

  const [productRows, postRows, categoryRows] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        salePrice: products.salePrice,
        thumbnail: products.thumbnail,
        badge: products.badge,
      })
      .from(products)
      .where(
        and(
          eq(products.status, "published"),
          isNull(products.deletedAt),
          or(
            sql`${products.name} ILIKE ${pattern}`,
            sql`${products.brand} ILIKE ${pattern}`,
            sql`${products.shortDescription} ILIKE ${pattern}`,
          )!,
        ),
      )
      .limit(8),
    db
      .select({ id: posts.id, title: posts.title, slug: posts.slug })
      .from(posts)
      .where(and(eq(posts.status, "published"), sql`${posts.title} ILIKE ${pattern}`))
      .limit(5),
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories)
      .where(
        and(
          eq(categories.active, true),
          isNull(categories.deletedAt),
          sql`${categories.name} ILIKE ${pattern}`,
        ),
      )
      .limit(5),
  ]);

  return NextResponse.json({
    products: productRows,
    posts: postRows,
    categories: categoryRows,
  });
}
