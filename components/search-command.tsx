"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { formatIDR } from "@/lib/utils";
import Image from "next/image";

interface SearchResult {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    thumbnail: string;
    badge: string;
  }[];
  posts: { id: string; title: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
}

async function search(q: string): Promise<SearchResult> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return { products: [], posts: [], categories: [] };
  return res.json();
}

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const debounced = useDebounce(q, 300);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => search(debounced),
    enabled: debounced.length > 0,
    placeholderData: (prev) => prev,
  });

  const hasResults =
    data && (data.products.length || data.posts.length || data.categories.length);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-background px-4 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Cari produk, artikel...</span>
        <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 text-[10px] sm:inline-block">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[15%] max-w-xl translate-y-0 p-0 sm:rounded-2xl">
          <DialogTitle className="sr-only">Pencarian</DialogTitle>
          <Command className="overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                value={q}
                onValueChange={setQ}
                placeholder="Cari produk, artikel, kategori..."
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              {isFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              {!debounced && (
                <Command.Empty className="p-6 text-center text-sm text-muted-foreground">
                  Ketik untuk mulai mencari
                </Command.Empty>
              )}
              {debounced && !hasResults && !isFetching && (
                <Command.Empty className="p-6 text-center text-sm text-muted-foreground">
                  Tidak ada hasil untuk &quot;{debounced}&quot;
                </Command.Empty>
              )}

              {data?.categories.length ? (
                <Command.Group heading="Kategori">
                  {data.categories.map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`category-${c.slug}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(`/categories/${c.slug}`);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      {c.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}

              {data?.products.length ? (
                <Command.Group heading="Produk">
                  {data.products.slice(0, 6).map((p) => (
                    <Command.Item
                      key={p.id}
                      value={`product-${p.slug}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(`/products/${p.slug}`);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent"
                    >
                      <Image
                        src={p.thumbnail || "/placeholders/1.svg"}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                        unoptimized
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-xs text-primary">
                          {formatIDR(p.salePrice || p.price)}
                        </p>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}

              {data?.posts.length ? (
                <Command.Group heading="Artikel">
                  {data.posts.slice(0, 4).map((p) => (
                    <Command.Item
                      key={p.id}
                      value={`post-${p.slug}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(`/blog/${p.slug}`);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      {p.title}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
