import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
