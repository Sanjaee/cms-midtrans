import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, midtransPayments, notifications } from "@/db/schema";
import {
  verifyMidtransSignature,
  mapMidtransStatus,
  getMidtransConfig,
} from "@/lib/midtrans";
import { sendOrderEmail, incrementDailyAnalytics } from "@/lib/order-actions";
import { generateId, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureKey = request.headers.get("x-signature-key") || "";

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const orderId = String(payload.order_id || "");
  const statusCode = String(payload.status_code || "");
  const grossAmount = String(payload.gross_amount || "");
  const transactionStatus = String(payload.transaction_status || "");
  const paymentType = String(payload.payment_type || "");
  const fraudStatus = String(payload.fraud_status || "");
  const transactionId = String(payload.transaction_id || "");

  const { serverKey } = await getMidtransConfig();

  const valid = verifyMidtransSignature({
    signatureKey,
    orderId,
    statusCode,
    grossAmount,
    serverKey,
  });

  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 403 });
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderId));
  if (!order) {
    return NextResponse.json({ ok: false, error: "order not found" }, { status: 404 });
  }

  const mapped = mapMidtransStatus(transactionStatus, fraudStatus);

  await db
    .insert(midtransPayments)
    .values({
      id: generateId(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      transactionId,
      status: mapped,
      paymentType,
      amount: Math.round(Number(grossAmount)),
      fraudStatus,
      rawPayload: payload,
    })
    .onConflictDoNothing();

  if (mapped === "paid") {
    await db
      .update(orders)
      .set({
        status: "paid",
        paymentStatus: "paid",
        paidAt: new Date(),
        paymentMethod: paymentType,
        midtransTransactionId: transactionId,
        midtransPaymentType: paymentType,
      })
      .where(eq(orders.id, order.id));

    await db.insert(notifications).values({
      id: generateId(),
      userId: order.userId,
      type: "payment",
      title: `Pembayaran berhasil untuk ${order.orderNumber}`,
      message: `Pembayaran sebesar ${formatIDR(order.total)} telah diterima. Pesanan akan segera diproses.`,
      link: `/account/orders/${order.id}`,
    });

    void sendOrderEmail({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      total: order.total,
    });

    void incrementDailyAnalytics(order.total);
  } else if (mapped === "expired" || mapped === "cancelled") {
    await db
      .update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "failed",
        cancelledAt: new Date(),
        paymentMethod: paymentType,
      })
      .where(eq(orders.id, order.id));
  } else if (mapped === "refunded") {
    await db
      .update(orders)
      .set({ status: "refunded", paymentStatus: "refunded", refundedAt: new Date() })
      .where(eq(orders.id, order.id));
  } else {
    await db
      .update(orders)
      .set({ status: "waiting_payment", paymentStatus: "pending", paymentMethod: paymentType })
      .where(eq(orders.id, order.id));
  }

  return NextResponse.json({ ok: true });
}
