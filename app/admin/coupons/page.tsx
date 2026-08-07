import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { CouponManager } from "@/components/admin/coupon-manager";

export const metadata: Metadata = { title: "Manajemen Kupon" };

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return (
    <CouponManager
      coupons={rows.map((c) => ({
        ...c,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      }))}
    />
  );
}
