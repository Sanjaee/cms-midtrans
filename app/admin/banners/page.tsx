import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { BannerManager } from "@/components/admin/banner-manager";

export const metadata: Metadata = { title: "Manajemen Banner" };

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const rows = await db.select().from(banners).orderBy(desc(banners.createdAt));
  return <BannerManager banners={rows} />;
}
