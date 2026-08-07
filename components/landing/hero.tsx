"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, ShieldCheck, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="bg-brand-gradient absolute -top-32 right-0 h-96 w-96 rounded-full opacity-20 blur-[120px]" />
        <div className="absolute left-0 top-1/3 h-96 w-96 rounded-full bg-indigo-500 opacity-10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-[size:28px_28px] opacity-40" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-0">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border bg-card/40 px-4 py-1.5 text-xs font-medium backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Koleksi Premium 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Belanja <span className="text-gradient">Premium</span> dengan
            Sentuhan <span className="text-gradient">Mewah</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Temukan produk pilihan kurasi untuk gaya hidup Anda. Original,
            berkualitas, dan dikirim dengan cepat ke seluruh Indonesia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button asChild size="xl">
              <Link href="/products">
                Belanja Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/#categories">Lihat Kategori</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Gratis Ongkir
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> 100% Original
            </span>
            <span className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4 text-primary" /> Diskon Menarik
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative mx-auto aspect-square w-full max-w-lg">
            <div className="absolute inset-4 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
            <Image
              src="/placeholders/1.svg"
              alt="Produk unggulan Nova Store"
              width={500}
              height={500}
              className="relative z-10 animate-float rounded-3xl border soft-shadow object-cover"
              unoptimized
              priority
            />
            <div className="glass absolute -left-8 top-10 z-20 rounded-2xl px-4 py-3 soft-shadow">
              <p className="text-xs text-muted-foreground">Terjual</p>
              <p className="text-lg font-bold">10.000+</p>
            </div>
            <div className="glass absolute -right-6 bottom-16 z-20 rounded-2xl px-4 py-3 soft-shadow">
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="text-lg font-bold">4.9/5.0</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
