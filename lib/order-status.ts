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
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  waiting_payment: {
    label: "Menunggu Pembayaran",
    color: "border border-foreground/30 bg-background text-foreground",
  },
  paid: { label: "Dibayar", color: "bg-primary text-primary-foreground" },
  processing: {
    label: "Diproses",
    color: "bg-secondary text-secondary-foreground",
  },
  shipped: {
    label: "Dikirim",
    color: "border border-foreground bg-background text-foreground",
  },
  completed: { label: "Selesai", color: "bg-primary text-primary-foreground" },
  cancelled: { label: "Dibatalkan", color: "bg-muted text-muted-foreground" },
  refunded: {
    label: "Dikembalikan",
    color: "bg-muted-2 text-muted-2-foreground",
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
