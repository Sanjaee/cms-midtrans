"use client";

import * as React from "react";
import Image from "next/image";
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

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 sm:flex-col">
        {all.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-16 w-16 overflow-hidden rounded-lg border transition-all",
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
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border bg-muted">
        <Image
          src={all[active]}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
