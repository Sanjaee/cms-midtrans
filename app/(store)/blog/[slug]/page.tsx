import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { desc, and, eq, ne } from "drizzle-orm";
import { CalendarDays, Clock, Eye, ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getPostBySlug, getPosts } from "@/lib/queries";
import { formatDate, readingTime, slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShareBar } from "@/components/blog/share-bar";
import { TrackView, ViewCounter } from "@/components/product/track-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Artikel Tidak Ditemukan" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: [post.thumbnail || ""],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // inject ids into headings for ToC
  let content = post.content || "";
  const toc = Array.from(content.matchAll(/<h([23])>(.*?)<\/h\1>/g)).map(
    (m) => {
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      return { id: slugify(text), text, level: Number(m[1]) };
    },
  );
  content = content.replace(/<h([23])>(.*?)<\/h\1>/g, (_, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    return `<h${level} id="${slugify(text)}">${inner}</h${level}>`;
  });

  const related = await db
    .select()
    .from(posts)
    .where(
      and(
        ne(posts.id, post.id),
        eq(posts.status, "published"),
        post.categoryId ? eq(posts.categoryId, post.categoryId) : undefined,
      ),
    )
    .orderBy(desc(posts.publishedAt))
    .limit(3);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/blog/${post.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <TrackView type="post" id={post.id} />

      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Semua Artikel
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_280px]">
        <article>
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="brand">Blog</Badge>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {post.publishedAt ? formatDate(post.publishedAt) : "-"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {readingTime(content)} menit baca
              </span>
              <ViewCounter value={post.views} />
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Oleh <span className="font-medium text-foreground">{post.authorName || "Zacode Store"}</span>
            </p>

            {post.thumbnail && (
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border">
                <Image src={post.thumbnail} alt={post.title} fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" unoptimized priority />
              </div>
            )}

            <div className="prose prose-sm mt-8 max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-bold prose-h2:text-xl prose-p:text-foreground/80 prose-li:text-foreground/80 prose-a:text-primary">
              <div
                dangerouslySetInnerHTML={{
                  __html: content || "<p>Konten artikel belum tersedia.</p>",
                }}
              />
            </div>

            {post.tags?.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 border-t pt-6">
              <ShareBar title={post.title} url={url} />
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          {toc.length > 0 && (
            <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Daftar Isi</h3>
              <nav className="mt-3 space-y-2 text-sm">
                {toc.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className={`block text-muted-foreground transition-colors hover:text-primary ${t.level === 3 ? "pl-4 text-xs" : "font-medium"}`}
                  >
                    {t.text}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold">Artikel Terkait</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((p, i) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={p.thumbnail || `/placeholders/${(i % 10) + 1}.svg`}
                    alt={p.title}
                    fill
                    sizes="33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(p.publishedAt || p.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
