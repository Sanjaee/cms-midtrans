import crypto from "crypto";
import { getSettings } from "@/lib/settings";

export interface MidtransCustomer {
  firstName: string;
  email: string;
  phone?: string | null;
}

export interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export async function getMidtransConfig() {
  const s = await getSettings();
  const envServer = process.env.MIDTRANS_SERVER_KEY || "";
  const envClient = process.env.MIDTRANS_CLIENT_KEY || "";
  const envProd = process.env.MIDTRANS_IS_PRODUCTION === "true";

  const serverKey =
    envServer && !envServer.includes("placeholder")
      ? envServer
      : s.midtransServerKey || "";
  const clientKey =
    envClient && !envClient.includes("placeholder")
      ? envClient
      : s.midtransClientKey || "";
  const isProduction =
    (s.midtransIsProduction || "").toLowerCase() === "true" || envProd;

  return { serverKey, clientKey, isProduction };
}

export function getSnapBase(isProduction: boolean) {
  return isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export function getSnapJsUrl(isProduction: boolean) {
  return isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

function basicAuth(serverKey: string) {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

export async function createSnapToken(params: {
  orderId: string;
  grossAmount: number;
  customer: MidtransCustomer;
  items: MidtransItem[];
}): Promise<{ token?: string; error?: string; redirect_url?: string }> {
  const { serverKey, isProduction } = await getMidtransConfig();
  if (!serverKey) {
    return {
      error:
        "Midtrans server key belum dikonfigurasi. Tambahkan di Settings → Pembayaran.",
    };
  }
  try {
    const res = await fetch(getSnapBase(isProduction), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: basicAuth(serverKey),
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.grossAmount,
        },
        customer_details: {
          first_name: params.customer.firstName,
          email: params.customer.email,
          phone: params.customer.phone || undefined,
        },
        item_details: params.items.map((i) => ({
          id: i.id,
          price: i.price,
          quantity: i.quantity,
          name: i.name.slice(0, 50),
        })),
        credit_card: {
          secure: true,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.status_message || "Gagal membuat pembayaran" };
    }
    return { token: data.token, redirect_url: data.redirect_url };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Gagal menghubungi Midtrans",
    };
  }
}

export function verifyMidtransSignature(params: {
  signatureKey: string;
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
}): boolean {
  if (!params.serverKey) return false;
  const computed = crypto
    .createHash("sha512")
    .update(
      `${params.orderId}${params.statusCode}${params.grossAmount}${params.serverKey}`,
    )
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(params.signatureKey),
  );
}

export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string,
) {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "accept" ? "paid" : "waiting_payment";
    case "settlement":
      return "paid";
    case "pending":
      return "waiting_payment";
    case "deny":
    case "cancel":
      return "cancelled";
    case "expire":
      return "expired";
    case "refund":
    case "partial_refund":
      return "refunded";
    case "challenge":
      return "pending";
    default:
      return "pending";
  }
}
