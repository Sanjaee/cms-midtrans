CREATE TYPE "public"."banner_type" AS ENUM('hero', 'promo', 'slider');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order', 'payment', 'shipping', 'promo', 'system');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'waiting_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'scheduled');--> statement-breakpoint
CREATE TYPE "public"."product_badge" AS ENUM('best_seller', 'new', 'limited', 'promo', 'none');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'customer');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity" text,
	"entity_id" text,
	"details" jsonb,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text DEFAULT 'Rumah' NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"postal_code" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"visitors" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"orders" integer DEFAULT 0 NOT NULL,
	"revenue" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"type" "banner_type" DEFAULT 'promo' NOT NULL,
	"image_desktop" text,
	"image_mobile" text,
	"link" text,
	"start_at" timestamp,
	"end_at" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"image" text,
	"banner" text,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "coupon_type" DEFAULT 'percent' NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"min_spend" integer DEFAULT 0 NOT NULL,
	"max_discount" integer,
	"expires_at" timestamp,
	"quota" integer,
	"used" integer DEFAULT 0 NOT NULL,
	"auto_apply" boolean DEFAULT false NOT NULL,
	"free_shipping" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"path" text,
	"folder" text DEFAULT 'uploads' NOT NULL,
	"mime" text,
	"size" integer DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "midtrans_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"order_number" text,
	"transaction_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_type" text,
	"amount" integer DEFAULT 0 NOT NULL,
	"va_number" text,
	"fraud_status" text,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"product_name" text NOT NULL,
	"product_image" text,
	"product_slug" text,
	"price" integer DEFAULT 0 NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"user_id" text,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"address_line" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"postal_code" text,
	"notes" text,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"coupon_code" text,
	"shipping_cost" integer DEFAULT 0 NOT NULL,
	"shipping_courier" text,
	"shipping_service" text,
	"total" integer DEFAULT 0 NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"midtrans_token" text,
	"midtrans_transaction_id" text,
	"midtrans_payment_type" text,
	"tracking_number" text,
	"shipping_status" text,
	"paid_at" timestamp,
	"shipped_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text DEFAULT '' NOT NULL,
	"thumbnail" text,
	"cover" text,
	"author_id" text,
	"author_name" text,
	"category_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"scheduled_at" timestamp,
	"views" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sku" text,
	"category_id" text,
	"brand" text,
	"short_description" text,
	"long_description" text,
	"specs" jsonb DEFAULT '{}'::jsonb,
	"price" integer DEFAULT 0 NOT NULL,
	"sale_price" integer,
	"discount_pct" integer DEFAULT 0 NOT NULL,
	"is_flash_sale" boolean DEFAULT false NOT NULL,
	"flash_sale_ends_at" timestamp,
	"stock" integer DEFAULT 0 NOT NULL,
	"weight" integer DEFAULT 0 NOT NULL,
	"thumbnail" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video" text,
	"badge" "product_badge" DEFAULT 'none' NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" text NOT NULL,
	"order_id" text,
	"rating" integer DEFAULT 5 NOT NULL,
	"title" text,
	"comment" text,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video" text,
	"helpful" integer DEFAULT 0 NOT NULL,
	"admin_reply" text,
	"reply_at" timestamp,
	"approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"remember" boolean DEFAULT false NOT NULL,
	"user_agent" text,
	"ip" text,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"avatar" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"product_name" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password" text,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"avatar" text,
	"bio" text,
	"email_verified" timestamp,
	"email_verify_token" text,
	"remember_token" text,
	"last_login_at" timestamp,
	"last_login_ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midtrans_payments" ADD CONSTRAINT "midtrans_payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_post_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."post_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "midtrans_order_idx" ON "midtrans_payments" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "settings_key_idx" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlists_user_product_idx" ON "wishlists" USING btree ("user_id","product_id");