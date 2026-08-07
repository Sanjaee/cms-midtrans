import "server-only";
import { and, desc, eq, gte, lte, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  categories,
  banners,
  testimonials,
  faqs,
  posts,
  orderItems,
  reviews,
  coupons,
  postCategories,
  type Product,
} from "@/db/schema";

export interface ProductWithCategory extends Product {
  category: { name: string; slug: string } | null;
}

export async function getCategories(activeOnly = true) {
  const rows = await db
    .select()
    .from(categories)
    .where(
      and(
        activeOnly ? eq(categories.active, true) : undefined,
        isNull(categories.deletedAt),
      ),
    )
    .orderBy(categories.sortOrder);
  return rows;
}

export async function getBanners(type?: string) {
  const now = new Date();
  const rows = await db
    .select()
    .from(banners)
    .where(
      and(
        eq(banners.active, true),
        type ? eq(banners.type, type as never) : undefined,
        sql`(${banners.startAt} IS NULL OR ${banners.startAt} <= ${now})`,
        sql`(${banners.endAt} IS NULL OR ${banners.endAt} >= ${now})`,
      ),
    )
    .orderBy(banners.sortOrder);
  return rows;
}

export async function getProducts({
  search,
  categorySlug,
  sort = "popular",
  minPrice,
  maxPrice,
  discountOnly,
  rating,
  inStock,
  limit = 24,
  offset = 0,
}: {
  search?: string;
  categorySlug?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  discountOnly?: boolean;
  rating?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const conditions = [
    eq(products.status, "published"),
    isNull(products.deletedAt),
  ];

  if (search) {
    conditions.push(
      or(
        sql`${products.name} ILIKE ${`%${search}%`}`,
        sql`${products.shortDescription} ILIKE ${`%${search}%`}`,
        sql`${products.brand} ILIKE ${`%${search}%`}`,
        sql`${products.sku} ILIKE ${`%${search}%`}`,
      )!,
    );
  }
  if (categorySlug) {
    conditions.push(sql`${products.categoryId} IN (
      SELECT ${categories.id} FROM ${categories}
      WHERE ${categories.slug} = ${categorySlug}
        AND ${categories.deletedAt} IS NULL
    )`);
  }
  if (minPrice !== undefined) {
    conditions.push(gte(sql`COALESCE(${products.salePrice}, ${products.price})`, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(sql`COALESCE(${products.salePrice}, ${products.price})`, maxPrice));
  }
  if (discountOnly) {
    conditions.push(sql`${products.salePrice} IS NOT NULL AND ${products.salePrice} < ${products.price}`);
  }
  if (rating && rating > 0) {
    conditions.push(gte(products.rating, String(rating)));
  }
  if (inStock) {
    conditions.push(gt(products.stock, 0));
  }

  const orderBy =
    sort === "newest"
      ? desc(products.createdAt)
      : sort === "price_asc"
        ? sql`COALESCE(${products.salePrice}, ${products.price}) ASC`
        : sort === "price_desc"
          ? sql`COALESCE(${products.salePrice}, ${products.price}) DESC`
          : sort === "rating"
            ? desc(products.rating)
            : desc(products.sold);

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const cats = await getCategories();
  const catMap = new Map(cats.map((c) => [c.id, c]));
  return rows.map((p) => ({
    ...p,
    category: p.categoryId ? catMap.get(p.categoryId)?.name ? {
      name: catMap.get(p.categoryId)!.name,
      slug: catMap.get(p.categoryId)!.slug,
    } : null : null,
  }));
}

export async function getProductCount({
  search,
  categorySlug,
  discountOnly,
  rating,
  inStock,
}: {
  search?: string;
  categorySlug?: string;
  discountOnly?: boolean;
  rating?: number;
  inStock?: boolean;
} = {}) {
  const conditions = [
    eq(products.status, "published"),
    isNull(products.deletedAt),
  ];
  if (search) {
    conditions.push(
      or(
        sql`${products.name} ILIKE ${`%${search}%`}`,
        sql`${products.shortDescription} ILIKE ${`%${search}%`}`,
        sql`${products.brand} ILIKE ${`%${search}%`}`,
      )!,
    );
  }
  if (categorySlug) {
    conditions.push(sql`${products.categoryId} IN (
      SELECT ${categories.id} FROM ${categories}
      WHERE ${categories.slug} = ${categorySlug}
        AND ${categories.deletedAt} IS NULL
    )`);
  }
  if (discountOnly) {
    conditions.push(sql`${products.salePrice} IS NOT NULL AND ${products.salePrice} < ${products.price}`);
  }
  if (rating && rating > 0) {
    conditions.push(gte(products.rating, String(rating)));
  }
  if (inStock) {
    conditions.push(gt(products.stock, 0));
  }
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(and(...conditions));
  return Number(row?.count || 0);
}

export async function getProductBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(products)
    .where(
      and(eq(products.slug, slug), isNull(products.deletedAt)),
    );
  if (!row) return null;
  const cats = await getCategories();
  const cat = row.categoryId
    ? cats.find((c) => c.id === row.categoryId)
    : null;
  return {
    ...row,
    category: cat ? { name: cat.name, slug: cat.slug } : null,
  };
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limit = 4) {
  if (!categoryId) return [];
  return getProducts({
    limit,
    categorySlug: (await getCategories()).find((c) => c.id === categoryId)?.slug,
  }).then((rows) => rows.filter((r) => r.id !== excludeId).slice(0, limit));
}

export async function getFlashSaleProducts(limit = 8) {
  return getProducts({ limit }).then((rows) =>
    rows
      .filter((p) => p.isFlashSale || (p.salePrice && p.salePrice < p.price))
      .slice(0, limit),
  );
}

export async function getFeaturedProducts(limit = 8) {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "published"),
        eq(products.featured, true),
        isNull(products.deletedAt),
      ),
    )
    .orderBy(desc(products.sold))
    .limit(limit);
  const cats = await getCategories();
  const catMap = new Map(cats.map((c) => [c.id, c]));
  return rows.map((p) => ({
    ...p,
    category: p.categoryId && catMap.get(p.categoryId)
      ? { name: catMap.get(p.categoryId)!.name, slug: catMap.get(p.categoryId)!.slug }
      : null,
  }));
}

export async function getNewestProducts(limit = 8) {
  return getProducts({ limit, sort: "newest" });
}

export async function getBestSellers(limit = 8) {
  return getProducts({ limit, sort: "popular" });
}

export async function getTestimonials() {
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.active, true))
    .orderBy(desc(testimonials.createdAt))
    .limit(12);
}

export async function getFaqs() {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.active, true))
    .orderBy(faqs.sortOrder);
}

export async function getPosts({
  limit = 6,
  offset = 0,
  categorySlug,
  search,
  featuredOnly,
}: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
} = {}) {
  const conditions = [
    eq(posts.status, "published"),
    sql`(${posts.publishedAt} IS NULL OR ${posts.publishedAt} <= NOW())`,
  ];
  if (categorySlug) {
    conditions.push(sql`${posts.categoryId} IN (SELECT ${postCategories.id} FROM post_categories WHERE slug = ${categorySlug})`);
  }
  if (search) {
    conditions.push(sql`(${posts.title} ILIKE ${`%${search}%`} OR ${posts.excerpt} ILIKE ${`%${search}%`})`);
  }
  if (featuredOnly) {
    conditions.push(eq(posts.featured, true));
  }
  return db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getPostBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")));
  return row || null;
}

export async function getPostCategories() {
  return db.select().from(postCategories).orderBy(postCategories.name);
}

export async function getProductReviews(productId: string) {
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.approved, true)))
    .orderBy(desc(reviews.createdAt));
  return rows;
}

export async function getTopSelling(limit = 5) {
  const result = await db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      productImage: orderItems.productImage,
      totalSold: sql<number>`SUM(${orderItems.qty})`,
      revenue: sql<number>`SUM(${orderItems.subtotal})`,
    })
    .from(orderItems)
    .groupBy(
      orderItems.productId,
      orderItems.productName,
      orderItems.productImage,
    )
    .orderBy(desc(sql`SUM(${orderItems.qty})`))
    .limit(limit);
  return result;
}

export async function getValidCoupon(code: string) {
  const now = new Date();
  const [row] = await db
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.code, code),
        eq(coupons.active, true),
        sql`(${coupons.expiresAt} IS NULL OR ${coupons.expiresAt} >= ${now})`,
        sql`(${coupons.quota} IS NULL OR ${coupons.used} < ${coupons.quota})`,
      ),
    );
  return row || null;
}

export async function getWishlistProducts(ids: string[]) {
  if (!ids.length) return [];
  return getProducts({ limit: ids.length }).then((rows) =>
    rows.filter((r) => ids.includes(r.id)),
  );
}
