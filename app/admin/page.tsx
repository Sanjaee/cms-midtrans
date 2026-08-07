import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  getOverview,
  getMonthlySales,
  getTopSellingProducts,
  getRecentOrders,
  getRecentCustomers,
  getRecentActivity,
} from "@/lib/admin-queries";
import { formatIDR, formatNumber, timeAgo } from "@/lib/utils";
import { statusLabel, statusColor } from "@/lib/order-status";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SalesChart } from "@/components/admin/charts";

export const metadata: Metadata = { title: "Dashboard Admin" };

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    overview,
    monthly,
    topSelling,
    recentOrders,
    recentCustomers,
    recentActivity,
  ] = await Promise.all([
    getOverview(),
    getMonthlySales(6),
    getTopSellingProducts(5),
    getRecentOrders(8),
    getRecentCustomers(6),
    getRecentActivity(10),
  ]);

  const stats = [
    {
      label: "Total Revenue",
      value: formatIDR(overview.revenue),
      icon: <DollarSign className="h-4 w-4" />,
      trend: 12,
      hint: "bulan ini",
    },
    {
      label: "Total Orders",
      value: formatNumber(overview.totalOrders),
      icon: <ShoppingCart className="h-4 w-4" />,
      trend: 8,
    },
    {
      label: "Total Customers",
      value: formatNumber(overview.totalCustomers),
      icon: <Users className="h-4 w-4" />,
      trend: 5,
    },
    {
      label: "Total Products",
      value: formatNumber(overview.totalProducts),
      icon: <Package className="h-4 w-4" />,
      hint: `${overview.totalCategories} kategori`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan performa toko Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" /> {overview.pendingOrders} pending
          </Badge>
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> {overview.paidOrders} dibayar
          </Badge>
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> {overview.cancelledOrders} batal
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Sales Bulanan</h2>
            <span className="flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> 6 bulan terakhir
            </span>
          </div>
          <SalesChart data={monthly} />
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Produk Terlaris</h2>
          <div className="space-y-3">
            {topSelling.map((p, i) => (
              <div key={p.productId || i} className="flex items-center gap-3">
                <Image
                  src={p.productImage || `/placeholders/${i + 1}.svg`}
                  alt={p.productName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                  unoptimized
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.totalSold} terjual
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatIDR(p.revenue)}
                </span>
              </div>
            ))}
            {!topSelling.length && (
              <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-semibold">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{o.customerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatIDR(o.total)}</span>
                  <Badge className={statusColor(o.status)}>
                    {statusLabel(o.status)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Pelanggan Terbaru</h2>
            </div>
            <div className="divide-y">
              {recentCustomers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/customers/${u.id}`}
                  className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar || undefined} />
                    <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(u.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">Aktivitas Terbaru</h2>
              <Link href="/admin/activity" className="text-xs text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="divide-y">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-6 py-2.5">
                  <span className="text-xs font-medium text-primary">{a.action}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {timeAgo(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
