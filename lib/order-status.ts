export type OrderStatus =
  | "pending"
  | "waiting_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
  waiting_payment: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  paid: { label: "Dibayar", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  processing: {
    label: "Diproses",
    color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  shipped: {
    label: "Dikirim",
    color: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  completed: { label: "Selesai", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  cancelled: { label: "Dibatalkan", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  refunded: {
    label: "Dikembalikan",
    color: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
};

export function statusLabel(status: string) {
  return ORDER_STATUS[status as OrderStatus]?.label || status;
}

export function statusColor(status: string) {
  return ORDER_STATUS[status as OrderStatus]?.color || "bg-muted text-muted-foreground";
}

export const ORDER_STATUS_FLOW = [
  "pending",
  "waiting_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
] as const;
