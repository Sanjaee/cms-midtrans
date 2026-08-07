"use client";

import * as React from "react";

const STATUSES = [
  "pending",
  "waiting_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
];

export function OrderStatusFilter({
  currentStatus,
  query,
}: {
  currentStatus: string;
  query?: string;
}) {
  return (
    <form action="/admin/orders">
      <input type="hidden" name="q" value={query || ""} />
      <select
        name="status"
        defaultValue={currentStatus || "all"}
        onChange={(e) => {
          const q = query ? `&q=${encodeURIComponent(query)}` : "";
          window.location.href = `/admin/orders?status=${e.target.value}${q}`;
        }}
        className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
      >
        <option value="all">Semua Status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
