"use server";

import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orders,
  orderItems,
  products,
  midtransPayments,
  notifications,
  analytics,
  coupons,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { generateId, generateOrderNumber, formatIDR } from "@/lib/utils";
import { getValidCoupon } from "@/lib/queries";
import { createSnapToken, isMidtransConfigured } from "@/lib/midtrans";
import { calculateShippingCost } from "@/lib/shipping";
import { sendMail, layoutEmail } from "@/lib/mail";

const itemSchema = z.object({
  id: z.string(),
  qty: z.coerce.number().min(1),
});

const checkoutSchema = z.object({
  items: z.array(itemSchema).min(1, "Keranjang kosong"),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  courierId: z.string().min(1),
  serviceId: z.string().min(1),
  couponCode: z.string().optional(),
});

export async function createOrderAction(input: {
  items: { id: string; qty: number }[];
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  notes?: string;
  courierId: string;
  serviceId: string;
  couponCode?: string;
}): Promise<{
  error?: string;
  orderId?: string;
  orderNumber?: string;
  snapToken?: string;
  testMode?: boolean;
}> {
  const user = await getSession();
  if (!user) return { error: "Silakan login untuk checkout" };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Data tidak valid" };
  const data = parsed.data;

  const ids = data.items.map((i) => i.id);
  if (ids.length === 0) return { error: "Keranjang kosong" };

  const productRows = await db
    .select()
    .from(products)
    .where(sql`${products.id} IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`);

  const productMap = new Map(productRows.map((p) => [p.id, p]));
  let subtotal = 0;
  let totalWeight = 0;
  const orderItemRows: {
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    productSlug: string;
    price: number;
    qty: number;
    subtotal: number;
  }[] = [];

  for (const item of data.items) {
    const product = productMap.get(item.id);
    if (!product) return { error: `Produk tidak ditemukan` };
    if (product.stock < item.qty) {
      return { error: `Stok ${product.name} tidak mencukupi` };
    }
    const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    const lineTotal = price * item.qty;
    subtotal += lineTotal;
    totalWeight += product.weight * item.qty;
    orderItemRows.push({
      id: generateId(),
      productId: product.id,
      productName: product.name,
      productImage: product.thumbnail,
      productSlug: product.slug,
      price,
      qty: item.qty,
      subtotal: lineTotal,
    });
  }

  let discount = 0;
  let couponId: string | null = null;
  let couponFreeShipping = false;
  if (data.couponCode) {
    const coupon = await getValidCoupon(data.couponCode.toUpperCase());
    if (!coupon) return { error: "Kupon tidak berlaku" };
    if (subtotal < coupon.minSpend) {
      return { error: `Minimal belanja ${formatIDR(coupon.minSpend)} untuk kupon ini` };
    }
    if (coupon.type === "percent") {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, subtotal);
    couponId = coupon.id;
    couponFreeShipping = coupon.freeShipping;
  }

  const shipping = await calculateShippingCost({
    courierId: data.courierId,
    serviceId: data.serviceId,
    weight: totalWeight,
    subtotal,
    couponFreeShipping,
  });
  if (!shipping.service || !shipping.courier) {
    return { error: "Kurir tidak tersedia" };
  }

  const total = subtotal - discount + shipping.cost;

  const orderNumber = generateOrderNumber();
  const orderId = generateId("ord");

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    userId: user.id,
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    addressLine: data.address,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    notes: data.notes,
    subtotal,
    discount,
    couponCode: data.couponCode?.toUpperCase(),
    shippingCost: shipping.cost,
    shippingCourier: shipping.courier.name,
    shippingService: shipping.service.name,
    total,
    status: "waiting_payment",
    paymentStatus: "pending",
  });

  await db.insert(orderItems).values(
    orderItemRows.map((r) => ({ ...r, orderId })),
  );

  for (const item of data.items) {
    await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${item.qty}` })
      .where(eq(products.id, item.id));
  }
  if (couponId) {
    await db
      .update(coupons)
      .set({ used: sql`${coupons.used} + 1` })
      .where(eq(coupons.id, couponId));
  }

  await db.insert(midtransPayments).values({
    id: generateId(),
    orderId,
    orderNumber,
    amount: total,
    status: "pending",
  });

  await db.insert(notifications).values({
    id: generateId(),
    userId: user.id,
    type: "order",
    title: `Pesanan ${orderNumber} dibuat`,
    message: "Pesanan Anda menunggu pembayaran. Silakan selesaikan pembayaran.",
    link: `/account/orders/${orderId}`,
  });

  const configured = await isMidtransConfigured();
  if (!configured) {
    return { orderId, orderNumber, testMode: true };
  }

  const snap = await createSnapToken({
    orderId: orderNumber,
    grossAmount: total,
    customer: { firstName: data.name, email: data.email, phone: data.phone },
    items: orderItemRows.map((r) => ({
      id: r.productId,
      price: r.price,
      quantity: r.qty,
      name: r.productName,
    })),
  });

  if (snap.token) {
    await db
      .update(orders)
      .set({ midtransToken: snap.token })
      .where(eq(orders.id, orderId));
  }

  if (snap.error) {
    return { error: snap.error, orderId, orderNumber };
  }
  return { orderId, orderNumber, snapToken: snap.token };
}

export async function completeTestPaymentAction(orderId: string): Promise<{
  error?: string;
  success?: string;
}> {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };

  const configured = await isMidtransConfigured();
  if (configured) {
    return { error: "Midtrans sudah dikonfigurasi, gunakan pembayaran asli" };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)));
  if (!order) return { error: "Pesanan tidak ditemukan" };
  if (order.paymentStatus === "paid") {
    return { error: "Pesanan sudah dibayar" };
  }

  const now = new Date();
  await db
    .update(orders)
    .set({
      status: "paid",
      paymentStatus: "paid",
      paymentMethod: "test_mode",
      paidAt: now,
    })
    .where(eq(orders.id, orderId));

  await db.insert(midtransPayments).values({
    id: generateId(),
    orderId,
    orderNumber: order.orderNumber,
    transactionId: `TEST-${Date.now()}`,
    status: "paid",
    paymentType: "test_mode",
    amount: order.total,
  });

  await db.insert(notifications).values({
    id: generateId(),
    userId: user.id,
    type: "payment",
    title: `Pembayaran berhasil untuk ${order.orderNumber}`,
    message:
      "Pembayaran mode uji telah diterima. Pesanan akan segera diproses.",
    link: `/account/orders/${orderId}`,
  });

  void incrementDailyAnalytics(order.total);
  return { success: "Pembayaran mode uji berhasil" };
}

export async function retryPaymentAction(orderId: string): Promise<{
  error?: string;
  snapToken?: string;
  testMode?: boolean;
}> {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)));
  if (!order) return { error: "Pesanan tidak ditemukan" };
  if (order.paymentStatus === "paid") return { error: "Pesanan sudah dibayar" };

  if (!(await isMidtransConfigured())) {
    return { testMode: true };
  }

  const [items] = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .limit(1);

  const snap = await createSnapToken({
    orderId: order.orderNumber,
    grossAmount: order.total,
    customer: {
      firstName: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    items: items
      ? [
          {
            id: items.productId || "item",
            price: order.total,
            quantity: 1,
            name: items.productName,
          },
        ]
      : [{ id: "item", price: order.total, quantity: 1, name: "Pesanan" }],
  });

  if (snap.token) {
    await db
      .update(orders)
      .set({ midtransToken: snap.token })
      .where(eq(orders.id, orderId));
    await db
      .update(midtransPayments)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(midtransPayments.orderId, orderId));
  }
  if (snap.error) return { error: snap.error };
  return { snapToken: snap.token };
}

export async function cancelOrderAction(orderId: string) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)));
  if (!order) return { error: "Pesanan tidak ditemukan" };
  if (!["pending", "waiting_payment"].includes(order.status)) {
    return { error: "Pesanan tidak dapat dibatalkan" };
  }
  if (order.paymentStatus !== "paid") {
    await db
      .update(orders)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        paymentStatus: "failed",
      })
      .where(eq(orders.id, orderId));
  }
  return { ok: true };
}

export async function sendOrderEmail(order: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
}) {
  await sendMail(
    order.customerEmail,
    `Pesanan ${order.orderNumber} diterima`,
    layoutEmail(
      "Pesanan Diterima",
      `Halo <strong>${order.customerName}</strong>, terima kasih! Pesanan Anda dengan nomor <strong>${order.orderNumber}</strong> sebesar <strong>${formatIDR(order.total)}</strong> telah diterima.`,
      {
        label: "Lihat Pesanan",
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account/orders`,
      },
    ),
  );
}

export async function incrementDailyAnalytics(orderTotal: number) {
  const today = new Date().toISOString().slice(0, 10);
  await db
    .insert(analytics)
    .values({ id: `a_${today}`, date: today, orders: 1, revenue: orderTotal })
    .onConflictDoUpdate({
      target: analytics.id,
      set: {
        orders: sql`${analytics.orders} + 1`,
        revenue: sql`${analytics.revenue} + ${orderTotal}`,
      },
    });
}
