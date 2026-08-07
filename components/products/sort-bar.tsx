"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SORTS = [
  { value: "popular", label: "Paling Laris" },
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
  { value: "rating", label: "Rating Terbaik" },
];

export function SortBar({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const sort = searchParams.get("sort") || "popular";

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{total}</span> produk
        ditemukan
      </p>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
