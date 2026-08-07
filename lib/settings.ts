import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { generateId } from "@/lib/utils";

export const DEFAULT_SETTINGS = {
  siteName: "Nova Store",
  tagline: "Premium essentials untuk hidup lebih baik",
  logo: "",
  favicon: "",
  contactEmail: "halo@nova.store",
  contactPhone: "+62 812 3456 7890",
  whatsapp: "6281234567890",
  address: "Jakarta, Indonesia",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  twitter: "https://x.com",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
  googleMapsEmbed: "",
  googleAnalyticsId: "",
  metaPixelId: "",
  seoTitle: "Nova Store — Belanja Premium Online",
  seoDescription:
    "Temukan produk premium pilihan dengan harga terbaik. Belanja mudah, aman, dan cepat.",
  seoKeywords: "nova store, belanja online, produk premium",
  maintenanceMode: "false",
  flashSaleEnabled: "true",
  freeShippingThreshold: "200000",
  shippingNote: "Pengiriman dihitung otomatis sesuai alamat Anda.",
  midtransServerKey: "",
  midtransClientKey: "",
  midtransIsProduction: "false",
  smtpHost: "",
  smtpPort: "587",
  smtpSecure: "false",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "Nova Store <noreply@nova.store>",
} as const;

export type SiteSettings = typeof DEFAULT_SETTINGS;

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return { ...DEFAULT_SETTINGS, ...map };
}

export async function updateSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function upsertSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    if (!(key in DEFAULT_SETTINGS)) continue;
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
}

export async function ensureDefaultSettings() {
  const existing = await db.select({ key: settings.key }).from(settings);
  const keys = new Set(existing.map((e) => e.key));
  const missing: [string, string][] = [];
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (!keys.has(key)) missing.push([key, value]);
  }
  if (missing.length) {
    await db.insert(settings).values(
      missing.map(([key, value]) => ({
        key,
        value,
        id: generateId(),
        updatedAt: new Date(),
      })),
    );
  }
}

export function getSetting(settingsMap: Record<string, string>, key: string) {
  return settingsMap[key] ?? (DEFAULT_SETTINGS as Record<string, string>)[key] ?? "";
}
