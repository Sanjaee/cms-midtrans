import type { Metadata } from "next";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Tambah Produk" };

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const cats = await db.select().from(categories);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tambah Produk</h1>
      <ProductForm categories={cats} />
    </div>
  );
}
