import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock } from "lucide-react";
import { getPosts, getPostCategories } from "@/lib/queries";
import { formatDate, readingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, panduan, dan inspirasi dari Nova Store.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const [posts, categories] = await Promise.all([
    getPosts({ limit: 12, search: sp.q, categorySlug: sp.category }),
    getPostCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Tips, panduan, dan inspirasi dari tim kami.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4">
        <form action="/blog" className="flex w-full max-w-md gap-2">
          <Input name="q" placeholder="Cari artikel..." defaultValue={sp.q} />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/blog"
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${!sp.category ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            Semua
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?category=${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${sp.category === c.slug ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="group overflow-hidden rounded-2xl border bg-card soft-shadow transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={p.thumbnail || `/placeholders/${(i % 10) + 1}.svg`}
                alt={p.title}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              {p.featured && (
                <Badge variant="brand" className="absolute left-3 top-3">Unggulan</Badge>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {p.publishedAt ? formatDate(p.publishedAt) : "-"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readingTime(p.content)} menit
                </span>
              </div>
              <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {p.excerpt}
              </p>
              {p.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {!posts.length && (
        <p className="mt-16 text-center text-muted-foreground">
          Tidak ada artikel ditemukan.
        </p>
      )}
    </div>
  );
}
