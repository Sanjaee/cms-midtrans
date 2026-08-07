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
        "relative overflow-hidden rounded-xl border bg-card p-5 soft-shadow",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-gradient opacity-10 blur-2xl" />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {typeof trend === "number" && trend !== 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend > 0 ? "text-emerald-500" : "text-rose-500",
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
