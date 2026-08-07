import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, posts, analytics } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { type, id } = body || {};
  const today = new Date().toISOString().slice(0, 10);

  if (type === "product" && id) {
    await db
      .update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, id));
  } else if (type === "post" && id) {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id));
  }

  await db
    .insert(analytics)
    .values({ id: `a_${today}`, date: today, visitors: 1 })
    .onConflictDoUpdate({
      target: analytics.id,
      set: { visitors: sql`${analytics.visitors} + 1` },
    });

  return NextResponse.json({ ok: true });
}
