import type { Metadata } from "next";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = { title: "Alamat Saya" };

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getSession();
  if (!user) return null;

  const rows = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, user.id))
    .orderBy(asc(addresses.isDefault));

  return (
    <AddressManager
      addresses={rows.map((a) => ({
        id: a.id,
        label: a.label,
        name: a.name,
        phone: a.phone,
        line1: a.line1,
        city: a.city,
        province: a.province,
        postalCode: a.postalCode,
        isDefault: a.isDefault,
      }))}
    />
  );
}
