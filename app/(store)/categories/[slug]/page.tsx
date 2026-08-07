import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageX } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  return {
    title: cat?.name || "Kategori",
    description: cat?.seoDescription || cat?.description || undefined,
    keywords: cat?.seoKeywords,
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cats = await getCategories();
  const category = cats.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getProducts({
    categorySlug: slug,
    sort: sp.sort,
    limit: 24,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="relative mb-10 overflow-hidden rounded-3xl border">
        <div className="relative h-52 w-full sm:h-64">
          <Image
            src={category.banner || category.image || "/placeholders/1.svg"}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8">
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            {category.description && (
              <p className="mt-1 max-w-xl text-sm text-white/80">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {products.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PackageX className="h-6 w-6" />}
          title="Belum ada produk"
          description="Produk pada kategori ini akan segera hadir."
        />
      )}
    </div>
  );
}
