import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({ value, count, size = "sm", className }: RatingProps) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
        <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) {
            return (
              <Star
                key={i}
                className={cn(
                  "fill-foreground text-foreground",
                  sizes[size],
                )}
              />
            );
          }
          if (i === full && hasHalf) {
            return (
              <StarHalf
                key={i}
                className={cn("fill-foreground text-foreground", sizes[size])}
              />
            );
          }
          return (
            <Star
              key={i}
              className={cn("text-muted-foreground/30", sizes[size])}
            />
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
