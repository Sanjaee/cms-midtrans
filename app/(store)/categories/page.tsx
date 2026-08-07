import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { SectionHeading } from "@/components/landing/section-heading";

export const metadata: Metadata = {
  title: "Kategori Produk",
  description: "Jelajahi semua kategori produk di Nova Store.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading
        eyebrow="Kategori"
        title="Semua Kategori"
        description="Temukan produk sesuai kebutuhan Anda."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-sm"
          >
            <Image
              src={c.image || `/placeholders/${(i % 10) + 1}.svg`}
              alt={c.name}
              fill
              sizes="(max-width:640px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="text-lg font-bold text-white">{c.name}</h3>
              {c.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/70">
                  {c.description}
                </p>
              )}
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
                Lihat Koleksi
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
