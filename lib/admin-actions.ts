"use server";

import { z } from "zod";
import { eq, asc, desc, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  products,
  categories,
  coupons,
  banners,
  posts,
  postCategories,
  orders,
  orderItems,
  testimonials,
  faqs,
  media,
  users,
  activityLogs,
  notifications,
  reviews,
} from "@/db/schema";
import { getSession, logActivity } from "@/lib/auth";
import { generateId, slugify } from "@/lib/utils";

async function requireAdminUser() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}

function err(e: unknown) {
  return { error: e instanceof Error ? e.message : "Terjadi kesalahan" };
}

// ---------- PRODUCTS ----------

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  brand: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  specs: z.record(z.string(), z.string()).optional(),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).nullable(),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  isFlashSale: z.boolean().optional(),
  flashSaleEndsAt: z.string().optional(),
  stock: z.coerce.number().min(0),
  weight: z.coerce.number().min(0),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).optional(),
  video: z.string().optional(),
  badge: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export async function createProductAction(input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const d = parsed.data;
  const price = d.price;
  const salePrice = d.salePrice ?? null;
  const discountPct =
    d.discountPct ??
    (salePrice && salePrice < price
      ? Math.round((1 - salePrice / price) * 100)
      : 0);

  const id = generateId("prd");
  await db.insert(products).values({
    id,
    name: d.name,
    slug: d.slug || slugify(d.name) || `product-${id}`,
    sku: d.sku,
    categoryId: d.categoryId || null,
    brand: d.brand,
    shortDescription: d.shortDescription,
    longDescription: d.longDescription,
    specs: d.specs || {},
    price,
    salePrice,
    discountPct,
    isFlashSale: d.isFlashSale || false,
    flashSaleEndsAt: d.flashSaleEndsAt ? new Date(d.flashSaleEndsAt) : null,
    stock: d.stock,
    weight: d.weight,
    thumbnail: d.thumbnail || (d.images?.[0]) || null,
    images: d.images || [],
    video: d.video,
    badge: (d.badge as never) || "none",
    status: (d.status as never) || "draft",
    featured: d.featured || false,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    seoKeywords: d.seoKeywords,
  });
  await logActivity(admin.id, "create_product", "product", id, { name: d.name });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "Produk berhasil dibuat", id };
}

export async function updateProductAction(id: string, input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const d = parsed.data;
  const price = d.price;
  const salePrice = d.salePrice ?? null;
  const discountPct =
    d.discountPct ??
    (salePrice && salePrice < price
      ? Math.round((1 - salePrice / price) * 100)
      : 0);

  await db
    .update(products)
    .set({
      name: d.name,
      slug: d.slug || slugify(d.name),
      sku: d.sku,
      categoryId: d.categoryId || null,
      brand: d.brand,
      shortDescription: d.shortDescription,
      longDescription: d.longDescription,
      specs: d.specs || {},
      price,
      salePrice,
      discountPct,
      isFlashSale: d.isFlashSale || false,
      flashSaleEndsAt: d.flashSaleEndsAt ? new Date(d.flashSaleEndsAt) : null,
      stock: d.stock,
      weight: d.weight,
      thumbnail: d.thumbnail || (d.images?.[0]) || null,
      images: d.images || [],
      video: d.video,
      badge: (d.badge as never) || "none",
      status: (d.status as never) || "draft",
      featured: d.featured || false,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      seoKeywords: d.seoKeywords,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
  await logActivity(admin.id, "update_product", "product", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: "Produk berhasil diperbarui" };
}

export async function deleteProductAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db
    .update(products)
    .set({ deletedAt: new Date() })
    .where(eq(products.id, id));
  await logActivity(admin.id, "soft_delete_product", "product", id);
  revalidatePath("/admin/products");
  return { success: "Produk dipindahkan ke tempat sampah" };
}

export async function restoreProductAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.update(products).set({ deletedAt: null }).where(eq(products.id, id));
  await logActivity(admin.id, "restore_product", "product", id);
  revalidatePath("/admin/products/trash");
  revalidatePath("/admin/products");
  return { success: "Produk dipulihkan" };
}

export async function hardDeleteProductAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products/trash");
  return { success: "Produk dihapus permanen" };
}

// ---------- CATEGORIES ----------

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  banner: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  active: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export async function createCategoryAction(input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: "Data tidak valid" };
  const d = parsed.data;
  const id = generateId("cat");
  await db.insert(categories).values({
    id,
    name: d.name,
    slug: d.slug || slugify(d.name),
    description: d.description,
    icon: d.icon,
    image: d.image,
    banner: d.banner,
    sortOrder: d.sortOrder || 0,
    active: d.active ?? true,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    seoKeywords: d.seoKeywords,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: "Kategori dibuat" };
}

export async function updateCategoryAction(id: string, input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: "Data tidak valid" };
  const d = parsed.data;
  await db
    .update(categories)
    .set({
      name: d.name,
      slug: d.slug || slugify(d.name),
      description: d.description,
      icon: d.icon,
      image: d.image,
      banner: d.banner,
      sortOrder: d.sortOrder || 0,
      active: d.active ?? true,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      seoKeywords: d.seoKeywords,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: "Kategori diperbarui" };
}

export async function deleteCategoryAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db
    .update(categories)
    .set({ deletedAt: new Date() })
    .where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  return { success: "Kategori dihapus" };
}

// ---------- COUPONS ----------

const couponSchema = z.object({
  code: z.string().min(2),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().min(1),
  minSpend: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).nullable().optional(),
  expiresAt: z.string().optional(),
  quota: z.coerce.number().min(0).nullable().optional(),
  autoApply: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function createCouponAction(input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { error: "Data tidak valid" };
  const d = parsed.data;
  await db.insert(coupons).values({
    id: generateId(),
    code: d.code.toUpperCase(),
    type: d.type,
    value: d.value,
    minSpend: d.minSpend || 0,
    maxDiscount: d.maxDiscount ?? null,
    expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    quota: d.quota ?? null,
    autoApply: d.autoApply || false,
    freeShipping: d.freeShipping || false,
    active: d.active ?? true,
  });
  revalidatePath("/admin/coupons");
  return { success: "Kupon dibuat" };
}

export async function updateCouponAction(id: string, input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { error: "Data tidak valid" };
  const d = parsed.data;
  await db
    .update(coupons)
    .set({
      code: d.code.toUpperCase(),
      type: d.type,
      value: d.value,
      minSpend: d.minSpend || 0,
      maxDiscount: d.maxDiscount ?? null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      quota: d.quota ?? null,
      autoApply: d.autoApply || false,
      freeShipping: d.freeShipping || false,
      active: d.active ?? true,
      updatedAt: new Date(),
    })
    .where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
  return { success: "Kupon diperbarui" };
}

export async function deleteCouponAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
  return { success: "Kupon dihapus" };
}

// ---------- BANNERS ----------

const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  type: z.enum(["hero", "promo", "slider"]),
  imageDesktop: z.string().optional(),
  imageMobile: z.string().optional(),
  link: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
});

export async function createBannerAction(input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { error: "Data tidak valid" };
  const d = parsed.data;
  await db.insert(banners).values({
    id: generateId(),
    title: d.title,
    subtitle: d.subtitle,
    type: d.type,
    imageDesktop: d.imageDesktop,
    imageMobile: d.imageMobile,
    link: d.link,
    startAt: d.startAt ? new Date(d.startAt) : null,
    endAt: d.endAt ? new Date(d.endAt) : null,
    active: d.active ?? true,
    sortOrder: d.sortOrder || 0,
  });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Banner dibuat" };
}

export async function updateBannerAction(id: string, input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { error: "Data tidak valid" };
  const d = parsed.data;
  await db
    .update(banners)
    .set({
      title: d.title,
      subtitle: d.subtitle,
      type: d.type,
      imageDesktop: d.imageDesktop,
      imageMobile: d.imageMobile,
      link: d.link,
      startAt: d.startAt ? new Date(d.startAt) : null,
      endAt: d.endAt ? new Date(d.endAt) : null,
      active: d.active ?? true,
      sortOrder: d.sortOrder || 0,
      updatedAt: new Date(),
    })
    .where(eq(banners.id, id));
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Banner diperbarui" };
}

export async function deleteBannerAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.delete(banners).where(eq(banners.id, id));
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Banner dihapus" };
}

// ---------- ORDERS ----------

const validOrderStatuses = [
  "pending",
  "waiting_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
] as const;

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  trackingNumber?: string,
) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  if (!validOrderStatuses.includes(status as never)) {
    return { error: "Status tidak valid" };
  }
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return { error: "Pesanan tidak ditemukan" };

  const set: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };
  if (trackingNumber !== undefined) set.trackingNumber = trackingNumber;
  if (status === "paid") {
    set.paidAt = new Date();
    set.paymentStatus = "paid";
  }
  if (status === "shipped") {
    set.shippedAt = new Date();
    set.shippingStatus = "in_transit";
  }
  if (status === "completed") set.completedAt = new Date();
  if (status === "cancelled") {
    set.cancelledAt = new Date();
    set.paymentStatus = "cancelled";
  }
  if (status === "refunded") {
    set.refundedAt = new Date();
    set.paymentStatus = "refunded";
  }

  await db.update(orders).set(set).where(eq(orders.id, orderId));
  await db.insert(notifications).values({
    id: generateId(),
    userId: order.userId,
    type: "shipping",
    title: `Pesanan ${order.orderNumber}: ${status}`,
    message: `Status pesanan Anda telah diperbarui menjadi ${status}.`,
    link: `/account/orders/${orderId}`,
  });
  await logActivity(admin.id, "update_order_status", "order", orderId, { status });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: "Status pesanan diperbarui" };
}

// ---------- BLOG ----------

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  thumbnail: z.string().optional(),
  cover: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export async function createPostAction(input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const d = parsed.data;
  const id = generateId("pst");
  const publishedAt =
    d.publishedAt ||
    (d.status === "published" ? new Date().toISOString() : undefined);
  await db.insert(posts).values({
    id,
    title: d.title,
    slug: d.slug || slugify(d.title) || `post-${id}`,
    excerpt: d.excerpt,
    content: d.content || "",
    thumbnail: d.thumbnail,
    cover: d.cover,
    authorId: admin.id,
    authorName: admin.name,
    categoryId: d.categoryId || null,
    tags: d.tags || [],
    status: (d.status as never) || "draft",
    featured: d.featured || false,
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    seoKeywords: d.seoKeywords,
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: "Artikel dibuat", id };
}

export async function updatePostAction(id: string, input: unknown) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const publishedAt =
    d.publishedAt ||
    (d.status === "published" ? new Date().toISOString() : undefined);
  await db
    .update(posts)
    .set({
      title: d.title,
      slug: d.slug || slugify(d.title),
      excerpt: d.excerpt,
      content: d.content || "",
      thumbnail: d.thumbnail,
      cover: d.cover,
      categoryId: d.categoryId || null,
      tags: d.tags || [],
      status: (d.status as never) || "draft",
      featured: d.featured || false,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      seoKeywords: d.seoKeywords,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: "Artikel diperbarui" };
}

export async function deletePostAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: "Artikel dihapus" };
}

export async function createPostCategoryAction(name: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.insert(postCategories).values({
    id: generateId(),
    name,
    slug: slugify(name),
  });
  revalidatePath("/admin/blog");
  return { success: "Kategori artikel dibuat" };
}

// ---------- TESTIMONIALS & FAQS ----------

export async function createTestimonialAction(input: {
  name: string;
  role?: string;
  content: string;
  rating: number;
  productName?: string;
}) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.insert(testimonials).values({
    id: generateId(),
    name: input.name,
    role: input.role,
    content: input.content,
    rating: input.rating,
    productName: input.productName,
  });
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: "Testimoni dibuat" };
}

export async function deleteTestimonialAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: "Testimoni dihapus" };
}

export async function createFaqAction(input: { question: string; answer: string }) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.insert(faqs).values({
    id: generateId(),
    question: input.question,
    answer: input.answer,
  });
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: "FAQ dibuat" };
}

export async function deleteFaqAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.delete(faqs).where(eq(faqs.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: "FAQ dihapus" };
}

// ---------- MEDIA ----------

export async function deleteMediaAction(id: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.delete(media).where(eq(media.id, id));
  revalidatePath("/admin/media");
  return { success: "File dihapus" };
}

// ---------- USERS ----------

export async function toggleUserStatusAction(userId: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { error: "Pengguna tidak ditemukan" };
  if (user.role === "admin") return { error: "Tidak dapat mengubah status admin" };
  await db
    .update(users)
    .set({ status: user.status === "active" ? "suspended" : "active" })
    .where(eq(users.id, userId));
  revalidatePath("/admin/customers");
  return { success: "Status pengguna diperbarui" };
}

// ---------- REVIEWS ----------

export async function approveReviewAction(reviewId: string, approve: boolean) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.update(reviews).set({ approved: approve }).where(eq(reviews.id, reviewId));
  revalidatePath("/admin");
  return { success: approve ? "Review disetujui" : "Review ditolak" };
}

export async function replyReviewAction(reviewId: string, reply: string) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db
    .update(reviews)
    .set({ adminReply: reply, replyAt: new Date() })
    .where(eq(reviews.id, reviewId));
  revalidatePath("/admin");
  return { success: "Balasan dikirim" };
}

// ---------- NOTIFICATIONS ----------

export async function markNotificationReadAction(id: string) {
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  return { ok: true };
}

export async function createNotificationAction(input: {
  title: string;
  message?: string;
  type: "order" | "payment" | "shipping" | "promo" | "system";
  userId?: string;
}) {
  const admin = await requireAdminUser().catch(() => null);
  if (!admin) return { error: "Unauthorized" };
  await db.insert(notifications).values({
    id: generateId(),
    userId: input.userId || null,
    type: input.type,
    title: input.title,
    message: input.message,
  });
  revalidatePath("/admin/notifications");
  return { success: "Notifikasi dikirim" };
}
