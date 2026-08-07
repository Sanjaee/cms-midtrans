import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit Produk" };

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) notFound();
  const cats = await db.select().from(categories);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Produk</h1>
      <ProductForm categories={cats} product={product} />
    </div>
  );
}
