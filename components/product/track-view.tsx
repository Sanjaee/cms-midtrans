"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Eye } from "lucide-react";

export function TrackView({ type, id }: { type: "product" | "post"; id: string }) {
  React.useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
      keepalive: true,
    }).catch(() => {});
  }, [type, id]);
  return null;
}

export function ViewCounter({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="h-3.5 w-3.5" /> {value} kali dilihat
    </span>
  );
}

export { useParams };
