"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function FilterSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const [min, setMin] = React.useState(searchParams.get("min") || "");
  const [max, setMax] = React.useState(searchParams.get("max") || "");

  const category = searchParams.get("category") || "";
  const discount = searchParams.get("discount") === "1";
  const stock = searchParams.get("stock") === "1";
  const rating = searchParams.get("rating") || "";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyPrice = () => {
    setParam("min", min);
    setParam("max", max);
  };

  const clearAll = () => {
    router.push(pathname);
    setMin("");
    setMax("");
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Filter
        </h3>
        <button
          onClick={clearAll}
          className="text-xs text-primary hover:underline"
        >
          Reset semua
        </button>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Kategori</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={!category}
              onCheckedChange={() => setParam("category", "")}
            />
            Semua
          </label>
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={category === c.slug}
                onCheckedChange={() =>
                  setParam("category", category === c.slug ? "" : c.slug)
                }
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Harga</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={applyPrice}
        >
          Terapkan
        </Button>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Penawaran</h4>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={discount}
            onCheckedChange={() => setParam("discount", discount ? "" : "1")}
          />
          Sedang diskon
        </label>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={stock}
            onCheckedChange={() => setParam("stock", stock ? "" : "1")}
          />
          Stok tersedia
        </label>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Rating</h4>
        <div className="flex flex-wrap gap-2">
          {["4", "3", "2"].map((r) => (
            <button
              key={r}
              onClick={() => setParam("rating", rating === r ? "" : r)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                rating === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-accent",
              )}
            >
              {r}+ ★
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">{content}</div>
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" /> Filter
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="bg-background/95 backdrop-blur-sm absolute inset-y-0 right-0 w-80 overflow-y-auto p-5 animate-in slide-in-from-right">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-5 w-5" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export function FilterSkeleton() {
  return (
    <div className="hidden space-y-6 lg:block">
      <Skeleton className="h-4 w-24" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
