import type { Metadata } from "next";
import Link from "next/link";
import {
  getProducts,
  getCategories,
  getProductCount,
} from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/product-card-skeleton";
import { FilterSidebar, FilterSkeleton } from "@/components/products/filter-sidebar";
import { SortBar } from "@/components/products/sort-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Semua Produk",
  description:
    "Jelajahi koleksi produk premium Zacode Store. Original, berkualitas, dan dikirim cepat.",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const categories = await getCategories();
  const page = Number(sp.page || 1);

  const products = await getProducts({
    search: sp.q,
    categorySlug: sp.category,
    sort: sp.sort,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    discountOnly: sp.discount === "1",
    rating: sp.rating ? Number(sp.rating) : undefined,
    inStock: sp.stock === "1",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const total = await getProductCount({
    search: sp.q,
    categorySlug: sp.category,
    discountOnly: sp.discount === "1",
    rating: sp.rating ? Number(sp.rating) : undefined,
    inStock: sp.stock === "1",
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Koleksi Produk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Temukan produk premium pilihan untuk Anda
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<FilterSkeleton />}>
          <FilterSidebar categories={categories} />
        </Suspense>

        <div>
          <SortBar total={total} />
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            {products.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<SearchX className="h-6 w-6" />}
                title="Tidak ada produk ditemukan"
                description="Coba ubah kata kunci atau filter pencarian Anda."
                action={
                  <Link href="/products">Reset Pencarian</Link>
                }
              />
            )}
          </Suspense>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                const params = new URLSearchParams();
                if (sp.q) params.set("q", sp.q);
                if (sp.category) params.set("category", sp.category);
                if (sp.sort) params.set("sort", sp.sort);
                params.set("page", String(n));
                return (
                  <Link
                    key={n}
                    href={`/products?${params.toString()}`}
                    className={
                      page === n
                        ? "bg-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground"
                        : "flex h-9 w-9 items-center justify-center rounded-full border text-sm hover:bg-accent"
                    }
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
