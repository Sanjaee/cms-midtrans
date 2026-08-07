import type { Metadata } from "next";
import {
  getOverview,
  getMonthlySales,
  getTopSellingProducts,
  getAnalytics,
  getRecentActivity,
} from "@/lib/admin-queries";
import { formatIDR, formatNumber } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChart, OrdersBarChart } from "@/components/admin/charts";
import { DollarSign, ShoppingCart, Users, Eye, TrendingUp, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Analytics" };

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [overview, monthly, topSelling, analyticsRows, recentActivity] = await Promise.all([
    getOverview(),
    getMonthlySales(12),
    getTopSellingProducts(10),
    getAnalytics(30),
    getRecentActivity(8),
  ]);

  const totalVisitors = analyticsRows.reduce((a, r) => a + r.visitors, 0);
  const conversionRate =
    totalVisitors > 0
      ? ((overview.paidOrders / totalVisitors) * 100).toFixed(2)
      : "0";

  const customerGrowth = overview.totalCustomers;
  const avgOrderValue =
    overview.paidOrders > 0
      ? Math.round(overview.revenue / overview.paidOrders)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Performa toko secara menyeluruh.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatIDR(overview.revenue)} icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp className="h-4 w-4" />} hint="dari visitor" />
        <StatCard label="Visitors" value={formatNumber(totalVisitors)} icon={<Eye className="h-4 w-4" />} hint="30 hari" />
        <StatCard label="Avg Order Value" value={formatIDR(avgOrderValue)} icon={<ShoppingCart className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Sales Chart (12 bulan)</CardTitle></CardHeader>
          <CardContent><SalesChart data={monthly} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Pesanan per Bulan</CardTitle></CardHeader>
          <CardContent><OrdersBarChart data={monthly} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Produk Terlaris</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Terjual</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSelling.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{p.productName}</TableCell>
                    <TableCell className="text-sm">{p.totalSold}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatIDR(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pertumbuhan Pelanggan & Aktivitas</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Total Customer</p>
              <p className="text-2xl font-bold">
                <Users className="mr-2 inline h-5 w-5 text-primary" />
                {formatNumber(customerGrowth)}
              </p>
            </div>
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" /> {a.action}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
