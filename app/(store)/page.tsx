import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  ShieldCheck,
  BadgePercent,
  RefreshCcw,
  Headset,
  Star,
  Quote,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import {
  getBanners,
  getCategories,
  getFeaturedProducts,
  getNewestProducts,
  getBestSellers,
  getFlashSaleProducts,
  getTestimonials,
  getFaqs,
  getPosts,
} from "@/lib/queries";
import { Hero195 } from "@/components/ui/hero-195";
import { SectionHeading } from "@/components/landing/section-heading";
import { ProductTabsSection } from "@/components/landing/product-tabs";
import { FlashSaleSection } from "@/components/landing/flash-sale";
import { NewsletterForm } from "@/components/landing/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { Countdown } from "@/components/countdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const [
    banners,
    categories,
    featured,
    newest,
    bestsellers,
    flashProducts,
    testimonials,
    faqs,
    posts,
  ] = await Promise.all([
    getBanners("promo"),
    getCategories(),
    getFeaturedProducts(8),
    getNewestProducts(8),
    getBestSellers(8),
    getFlashSaleProducts(8),
    getTestimonials(),
    getFaqs(),
    getPosts({ limit: 3 }),
  ]);

  const flashTimes = flashProducts
    .map((p) => p.flashSaleEndsAt?.getTime())
    .filter((t): t is number => Boolean(t));
  const flashEndsAt =
    flashTimes.length > 0
      ? Math.max(...flashTimes)
      : // eslint-disable-next-line
        Date.now() + 24 * 60 * 60 * 1000;

  const benefits = [
    {
      icon: Truck,
      title: "Pengiriman Cepat",
      desc: "Seluruh Indonesia, dilacak real-time.",
    },
    {
      icon: ShieldCheck,
      title: "Garansi Original",
      desc: "100% produk original, garansi resmi.",
    },
    {
      icon: BadgePercent,
      title: "Harga Terbaik",
      desc: "Promo dan voucher setiap minggu.",
    },
    {
      icon: RefreshCcw,
      title: "Mudah Dikembalikan",
      desc: "Garansi pengembalian 7 hari.",
    },
  ];

  const promo = banners.find((b) => b.type === "promo");

  return (
    <div>
      <Hero195 />

      {promo && (
        <section className="mx-auto max-w-7xl px-4">
          <Link
            href={promo.link || "/products"}
            className="group relative block overflow-hidden rounded-2xl"
          >
            <div className="bg-primary relative flex h-32 items-center justify-between overflow-hidden px-8 sm:h-40 sm:px-14">
              <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_30%,hsl(0 0% 98%),transparent_50%)]" />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
                  Promo Spesial
                </p>
                <h3 className="mt-1 text-xl font-bold text-primary-foreground sm:text-3xl">
                  {promo.title}
                </h3>
                {promo.subtitle && (
                  <p className="mt-1 text-sm text-primary-foreground/80">{promo.subtitle}</p>
                )}
              </div>
              <span className="relative z-10 hidden rounded-full bg-primary-foreground/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground backdrop-blur transition-transform group-hover:scale-105 sm:block">
                Cek Sekarang →
              </span>
            </div>
          </Link>
        </section>
      )}

      <FlashSaleSection products={flashProducts} endsAt={String(flashEndsAt)} />

      <ProductTabsSection
        featured={featured}
        newest={newest}
        bestsellers={bestsellers}
      />

      <section id="categories" className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Kategori"
            title="Jelajahi Kategori"
            description="Temukan produk favorit Anda berdasarkan kategori."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((c, i) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border shadow-sm"
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
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-white/70">
                    Lihat koleksi{" "}
                    <ArrowRight className="inline h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-emerald-600 mb-4 flex h-12 w-12 items-center justify-center rounded-md text-white shadow-sm">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Testimoni"
            title="Apa Kata Pelanggan"
            description="Kepercayaan pelanggan adalah prioritas kami."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="relative rounded-2xl border bg-card p-6 shadow-sm"
              >
                <Quote className="h-6 w-6 text-primary/40" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  &quot;{t.content}&quot;
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role || t.productName}
                    </p>
                  </div>
                  <Rating value={t.rating} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            eyebrow="FAQ"
            title="Pertanyaan yang Sering Diajukan"
          />
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.id} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <SectionHeading
              eyebrow="Blog"
              title="Artikel Terbaru"
              description="Tips, panduan, dan inspirasi dari tim kami."
              align="left"
              className="mb-0"
            />
            <Link
              href="/blog"
              className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              Semua Artikel <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
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
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <Badge className="absolute left-3 top-3 bg-black/60 text-white backdrop-blur-sm">
                    {p.categoryId ? "Blog" : "Tips"}
                  </Badge>
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {p.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="bg-primary relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-14">
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,hsl(0 0% 98%),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(0 0% 98%),transparent_40%)]" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
              Dapatkan Update & Diskon Eksklusif
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/80">
              Berlangganan newsletter kami untuk mendapatkan info produk baru
              dan kode promo eksklusif.
            </p>
            <div className="mt-6 flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Instagram"
            title="@nova.store"
            description="Ikuti kami di Instagram untuk konten eksklusif."
          />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={`/placeholders/${((i % 10) + 1) * 3 + 1}.svg`}
                  alt="Instagram feed"
                  fill
                  sizes="12vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <InstagramIcon className="h-5 w-5 text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Kontak"
            title="Hubungi Kami"
            description="Tim kami siap membantu Anda 7 hari seminggu."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {[
                { icon: MapPin, label: "Alamat", value: "Jakarta, Indonesia" },
                { icon: Mail, label: "Email", value: "halo@nova.store" },
                { icon: Phone, label: "Telepon", value: "+62 812 3456 7890" },
                { icon: Headset, label: "Jam Operasional", value: "Senin - Sabtu, 09.00 - 18.00 WIB" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="bg-emerald-600 flex h-11 w-11 items-center justify-center rounded-xl text-white">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="font-medium">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-sm">
              <div className="bg-emerald-600 flex h-16 w-16 items-center justify-center rounded-full text-white">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                Butuh bantuan cepat?
              </h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Chat langsung dengan tim kami melalui WhatsApp, respon cepat
                setiap hari.
              </p>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" /> Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
