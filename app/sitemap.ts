import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products, posts, categories } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const [productRows, postRows, categoryRows] = await Promise.all([
    db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.status, "published")),
    db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.status, "published")),
    db
      .select({ slug: categories.slug })
      .from(categories)
      .where(isNull(categories.deletedAt)),
  ]);

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/products`, lastModified: new Date() },
    { url: `${base}/categories`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    ...categoryRows.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: new Date(),
    })),
    ...productRows.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
    })),
    ...postRows.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
