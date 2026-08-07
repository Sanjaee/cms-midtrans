import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  hint?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5 text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted text-muted-foreground">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {typeof trend === "number" && trend !== 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend > 0 ? "text-primary" : "text-primary",
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
