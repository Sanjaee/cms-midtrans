import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Share2, Truck, ShieldCheck, RefreshCcw, Package } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
  getProductReviews,
} from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { formatIDR, cn } from "@/lib/utils";
import { Gallery } from "@/components/product/gallery";
import { AddToCart } from "@/components/product/add-to-cart";
import { ReviewsSection } from "@/components/product/reviews";
import { TrackView } from "@/components/product/track-view";
import { ProductCard } from "@/components/product-card";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/landing/section-heading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    keywords: product.seoKeywords,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.name,
      images: [product.thumbnail || ""],
    },
  };
}

export const dynamic = "force-dynamic";

const badgeLabels: Record<string, string> = {
  best_seller: "Best Seller",
  new: "Baru",
  limited: "Limited",
  promo: "Promo",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related, user] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.categoryId, product.id, 4),
    getSession(),
  ]);

  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <TrackView type="product" id={product.id} />

      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground">Produk</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery
          images={product.images}
          thumbnail={product.thumbnail}
          name={product.name}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge !== "none" && badgeLabels[product.badge] && (
              <Badge variant="brand">{badgeLabels[product.badge]}</Badge>
            )}
            {product.isFlashSale && (
              <Badge variant="destructive">Flash Sale</Badge>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <Badge variant="warning">
                Sisa {product.stock} unit!
              </Badge>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <Rating value={Number(product.rating) || 0} count={product.ratingCount} size="md" />
            <span className="text-muted-foreground">
              {product.sold > 0 && `${product.sold}+ terjual`}
            </span>
            {product.brand && (
              <span className="text-muted-foreground">
                Brand: <span className="text-foreground">{product.brand}</span>
              </span>
            )}
          </div>

          <div className="mt-5 rounded-2xl border bg-card p-5">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatIDR(price)}
              </span>
              {hasDiscount && (
                <span className="pb-1 text-lg text-muted-foreground line-through">
                  {formatIDR(product.price)}
                </span>
              )}
              {hasDiscount && (
                <Badge variant="success">
                  Hemat {formatIDR(product.price - price)}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Termasuk PPN · Gratis ongkir min. belanja tertentu
            </p>
          </div>

          {product.shortDescription && (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-6">
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                thumbnail: product.thumbnail,
                stock: product.stock,
                weight: product.weight,
              }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
            {[
              { icon: Truck, label: "Pengiriman Cepat" },
              { icon: ShieldCheck, label: "Garansi Original" },
              { icon: RefreshCcw, label: "Mudah Return" },
              { icon: Package, label: `Berat ${product.weight}g` },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center"
              >
                <f.icon className="h-4 w-4 text-primary" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Deskripsi</TabsTrigger>
            <TabsTrigger value="specs">Spesifikasi</TabsTrigger>
            <TabsTrigger value="reviews">
              Ulasan ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="rounded-2xl border bg-card p-6 shadow-sm">
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold"
              dangerouslySetInnerHTML={{
                __html: product.longDescription || product.shortDescription || "Belum ada deskripsi.",
              }}
            />
          </TabsContent>

          <TabsContent value="specs" className="rounded-2xl border bg-card shadow-sm">
            {product.specs && Object.keys(product.specs).length ? (
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="border-b last:border-0">
                      <td className="w-1/3 bg-muted/50 px-5 py-3 font-medium">
                        {k}
                      </td>
                      <td className="px-5 py-3">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-sm text-muted-foreground">
                Belum ada spesifikasi.
              </p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <ReviewsSection
              productId={product.id}
              reviews={reviews as never}
              isLoggedIn={Boolean(user)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeading
            eyebrow="Rekomendasi"
            title="Produk Terkait"
            align="left"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
