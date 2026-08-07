import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  decimal,
  uniqueIndex,
  index,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "customer"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);
export const productBadgeEnum = pgEnum("product_badge", [
  "best_seller",
  "new",
  "limited",
  "promo",
  "none",
]);
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
]);
export const couponTypeEnum = pgEnum("coupon_type", ["percent", "fixed"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "waiting_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
]);
export const bannerTypeEnum = pgEnum("banner_type", ["hero", "promo", "slider"]);
export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "published",
  "scheduled",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "order",
  "payment",
  "shipping",
  "promo",
  "system",
]);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    password: text("password"),
    role: roleEnum("role").notNull().default("customer"),
    status: userStatusEnum("status").notNull().default("active"),
    avatar: text("avatar"),
    bio: text("bio"),
    emailVerified: timestamp("email_verified"),
    emailVerifyToken: text("email_verify_token"),
    rememberToken: text("remember_token"),
    lastLoginAt: timestamp("last_login_at"),
    lastLoginIp: text("last_login_ip"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    remember: boolean("remember").notNull().default(false),
    userAgent: text("user_agent"),
    ip: text("ip"),
    lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_token_idx").on(t.token),
    index("sessions_user_idx").on(t.userId),
  ],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon"),
  image: text("image"),
  banner: text("banner"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku"),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    brand: text("brand"),
    shortDescription: text("short_description"),
    longDescription: text("long_description"),
    specs: jsonb("specs").$type<Record<string, string>>().default({}),
    price: integer("price").notNull().default(0),
    salePrice: integer("sale_price"),
    discountPct: integer("discount_pct").notNull().default(0),
    isFlashSale: boolean("is_flash_sale").notNull().default(false),
    flashSaleEndsAt: timestamp("flash_sale_ends_at"),
    stock: integer("stock").notNull().default(0),
    weight: integer("weight").notNull().default(0),
    thumbnail: text("thumbnail"),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    video: text("video"),
    badge: productBadgeEnum("badge").notNull().default("none"),
    status: productStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    sold: integer("sold").notNull().default(0),
    views: integer("views").notNull().default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
    ratingCount: integer("rating_count").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoKeywords: text("seo_keywords"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
  ],
);

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  type: couponTypeEnum("type").notNull().default("percent"),
  value: integer("value").notNull().default(0),
  minSpend: integer("min_spend").notNull().default(0),
  maxDiscount: integer("max_discount"),
  expiresAt: timestamp("expires_at"),
  quota: integer("quota"),
  used: integer("used").notNull().default(0),
  autoApply: boolean("auto_apply").notNull().default(false),
  freeShipping: boolean("free_shipping").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    addressLine: text("address_line").notNull(),
    city: text("city").notNull(),
    province: text("province").notNull(),
    postalCode: text("postal_code"),
    notes: text("notes"),
    subtotal: integer("subtotal").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    couponCode: text("coupon_code"),
    shippingCost: integer("shipping_cost").notNull().default(0),
    shippingCourier: text("shipping_courier"),
    shippingService: text("shipping_service"),
    total: integer("total").notNull().default(0),
    status: orderStatusEnum("status").notNull().default("pending"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    paymentMethod: text("payment_method"),
    midtransToken: text("midtrans_token"),
    midtransTransactionId: text("midtrans_transaction_id"),
    midtransPaymentType: text("midtrans_payment_type"),
    trackingNumber: text("tracking_number"),
    shippingStatus: text("shipping_status"),
    paidAt: timestamp("paid_at"),
    shippedAt: timestamp("shipped_at"),
    completedAt: timestamp("completed_at"),
    cancelledAt: timestamp("cancelled_at"),
    refundedAt: timestamp("refunded_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.orderNumber),
    index("orders_user_idx").on(t.userId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    productImage: text("product_image"),
    productSlug: text("product_slug"),
    price: integer("price").notNull().default(0),
    qty: integer("qty").notNull().default(1),
    subtotal: integer("subtotal").notNull().default(0),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Rumah"),
  name: text("name").notNull(),
  phone: text("phone"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const wishlists = pgTable(
  "wishlists",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("wishlists_user_product_idx").on(t.userId, t.productId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: text("order_id"),
    rating: integer("rating").notNull().default(5),
    title: text("title"),
    comment: text("comment"),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    video: text("video"),
    helpful: integer("helpful").notNull().default(0),
    adminReply: text("admin_reply"),
    replyAt: timestamp("reply_at"),
    approved: boolean("approved").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)],
);

export const banners = pgTable("banners", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  type: bannerTypeEnum("type").notNull().default("promo"),
  imageDesktop: text("image_desktop"),
  imageMobile: text("image_mobile"),
  link: text("link"),
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postCategories = pgTable("post_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull().default(""),
    thumbnail: text("thumbnail"),
    cover: text("cover"),
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name"),
    categoryId: text("category_id").references(() => postCategories.id, {
      onDelete: "set null",
    }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    status: postStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    publishedAt: timestamp("published_at"),
    scheduledAt: timestamp("scheduled_at"),
    views: integer("views").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoKeywords: text("seo_keywords"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("posts_slug_idx").on(t.slug)],
);

export const midtransPayments = pgTable(
  "midtrans_payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
    orderNumber: text("order_number"),
    transactionId: text("transaction_id"),
    status: text("status").notNull().default("pending"),
    paymentType: text("payment_type"),
    amount: integer("amount").notNull().default(0),
    vaNumber: text("va_number"),
    fraudStatus: text("fraud_status"),
    rawPayload: jsonb("raw_payload"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("midtrans_order_idx").on(t.orderId)],
);

export const settings = pgTable(
  "settings",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull().default(""),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("settings_key_idx").on(t.key)],
);

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  path: text("path"),
  folder: text("folder").notNull().default("uploads"),
  mime: text("mime"),
  size: integer("size").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  uploadedBy: text("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull().default("system"),
    title: text("title").notNull(),
    message: text("message"),
    link: text("link"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity"),
    entityId: text("entity_id"),
    details: jsonb("details"),
    ip: text("ip"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("activity_user_idx").on(t.userId)],
);

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("newsletter_email_idx").on(t.email)],
);

export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  avatar: text("avatar"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  productName: text("product_name"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const analytics = pgTable("analytics", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  visitors: integer("visitors").notNull().default(0),
  views: integer("views").notNull().default(0),
  orders: integer("orders").notNull().default(0),
  revenue: integer("revenue").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Post = typeof posts.$inferSelect;
