import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { products, categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") || "";
  const ids = idsParam.split(",").filter(Boolean);
  if (!ids.length) return NextResponse.json({ products: [] });

  const rows = await db
    .select()
    .from(products)
    .where(sql`${products.id} IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`);

  const cats = await db.select().from(categories);
  const catMap = new Map(cats.map((c) => [c.id, c]));

  return NextResponse.json({
    products: rows.map((p) => ({
      ...p,
      category: p.categoryId && catMap.get(p.categoryId)
        ? { name: catMap.get(p.categoryId)!.name, slug: catMap.get(p.categoryId)!.slug }
        : null,
    })),
  });
}
