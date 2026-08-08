"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  thumbnail,
  name,
}: {
  images: string[];
  thumbnail: string | null;
  name: string;
}) {
  const all = images.length ? images : [thumbnail || "/placeholders/1.svg"];
  const [active, setActive] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);

  const prev = () => setActive((i) => (i - 1 + all.length) % all.length);
  const next = () => setActive((i) => (i + 1) % all.length);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 sm:flex-col">
        {all.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Lihat gambar ${i + 1}`}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-all",
              active === i
                ? "border-primary ring-2 ring-ring"
                : "opacity-60 hover:opacity-100",
            )}
          >
            <Image
              src={img}
              alt={`${name} ${i + 1}`}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={all[active]}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
                priority
              />
            </motion.div>
          </AnimatePresence>

          {all.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Gambar sebelumnya"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Gambar berikutnya"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <button
            onClick={() => setLightbox(true)}
            aria-label="Perbesar gambar"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {all.length > 1 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
              {active + 1} / {all.length}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
          {all.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Lihat gambar ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border",
                active === i ? "border-primary" : "opacity-60",
              )}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              aria-label="Tutup"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {active + 1} / {all.length}
            </span>

            <button
              aria-label="Gambar sebelumnya"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              aria-label="Gambar berikutnya"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div
              className="relative h-full max-h-[85vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={all[active]}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
                unoptimized
              />
            </div>

            <div className="absolute bottom-4 flex gap-2">
              {all.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(i);
                  }}
                  aria-label={`Lihat gambar ${i + 1}`}
                  className={cn(
                    "relative h-14 w-14 overflow-hidden rounded-md border-2",
                    active === i
                      ? "border-white"
                      : "border-transparent opacity-50",
                  )}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
