import "server-only";
import { desc, eq, sql, and, gte, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  orders,
  users,
  products,
  orderItems,
  activityLogs,
  analytics,
  categories,
  coupons,
  reviews,
} from "@/db/schema";

export async function getOverview() {
  const [revenueRow] = await db
    .select({
      value: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(eq(orders.paymentStatus, "paid"));
  const [counts] = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      pending: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'pending' OR ${orders.status} = 'waiting_payment')`,
      paid: sql<number>`count(*) FILTER (WHERE ${orders.paymentStatus} = 'paid')`,
      cancelled: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'cancelled')`,
    })
    .from(orders);
  const [usersCount] = await db
    .select({ value: sql<number>`count(*)` })
    .from(users);
  const [productsCount] = await db
    .select({ value: sql<number>`count(*)` })
    .from(products)
    .where(isNull(products.deletedAt));
  const [categoriesCount] = await db
    .select({ value: sql<number>`count(*)` })
    .from(categories);
  const [reviewsCount] = await db
    .select({ value: sql<number>`count(*)` })
    .from(reviews);

  return {
    revenue: Number(revenueRow?.value || 0),
    totalOrders: Number(counts?.totalOrders || 0),
    pendingOrders: Number(counts?.pending || 0),
    paidOrders: Number(counts?.paid || 0),
    cancelledOrders: Number(counts?.cancelled || 0),
    totalCustomers: Number(usersCount?.value || 0),
    totalProducts: Number(productsCount?.value || 0),
    totalCategories: Number(categoriesCount?.value || 0),
    totalReviews: Number(reviewsCount?.value || 0),
  };
}

export async function getMonthlySales(months = 6) {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      month: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
      revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      orders: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, start), eq(orders.paymentStatus, "paid")))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`);

  const monthMap = new Map<string, { revenue: number; orders: number }>();
  for (const r of rows) {
    monthMap.set(r.month, { revenue: Number(r.revenue), orders: Number(r.orders) });
  }
  const monthsArr: { label: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", { month: "short" });
    const val = monthMap.get(key) || { revenue: 0, orders: 0 };
    monthsArr.push({ label, ...val });
  }
  return monthsArr;
}

export async function getTopSellingProducts(limit = 5) {
  const rows = await db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      productImage: orderItems.productImage,
      totalSold: sql<number>`SUM(${orderItems.qty})`,
      revenue: sql<number>`SUM(${orderItems.subtotal})`,
    })
    .from(orderItems)
    .groupBy(orderItems.productId, orderItems.productName, orderItems.productImage)
    .orderBy(desc(sql`SUM(${orderItems.qty})`))
    .limit(limit);
  return rows;
}

export async function getRecentOrders(limit = 8) {
  return db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getRecentCustomers(limit = 6) {
  return db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

export async function getRecentActivity(limit = 10) {
  return db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getAnalytics(limit = 30) {
  const rows = await db
    .select()
    .from(analytics)
    .orderBy(desc(analytics.date))
    .limit(limit);
  return rows.reverse();
}

export async function getDashboardNotifications(limit = 8) {
  const [ordersRow] = await db
    .select({ value: sql<number>`count(*)` })
    .from(orders)
    .where(sql`${orders.status} IN ('pending', 'waiting_payment')`);
  const [reviewsRow] = await db
    .select({ value: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.approved, false));
  return {
    pendingOrders: Number(ordersRow?.value || 0),
    pendingReviews: Number(reviewsRow?.value || 0),
  };
}
