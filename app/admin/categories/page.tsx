import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Manajemen Kategori" };

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return <CategoryManager categories={rows} />;
}
