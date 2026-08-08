import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  BadgePercent,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";

export function Hero195() {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-6.5rem)] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Koleksi Premium 2026
          </Badge>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Belanja Premium dengan{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Sentuhan Mewah
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Temukan produk pilihan kurasi untuk gaya hidup Anda. Original,
            berkualitas, dan dikirim dengan cepat ke seluruh Indonesia.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="xl">
              <Link href="/products">
                Belanja Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/#categories">Lihat Kategori</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Gratis Ongkir
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> 100% Original
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Diskon Menarik
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <Card className="relative aspect-square w-full max-w-lg overflow-hidden border">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80"
              alt="Produk unggulan Zacode Store"
              fill
              sizes="(max-width: 1024px) 0px, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/80 p-4 backdrop-blur-sm">
              <div>
                <p className="text-sm font-semibold">Wireless Earbuds Pro</p>
                <p className="text-xs text-muted-foreground">
                  Active Noise Cancelling · 36 jam baterai
                </p>
              </div>
              <Badge variant="success">Rp 699.000</Badge>
            </div>
            <BorderBeam
              size={250}
              duration={12}
              colorFrom="#a1a1aa"
              colorTo="#18181b"
            />
          </Card>
        </div>
      </div>
    </section>
  );
}
