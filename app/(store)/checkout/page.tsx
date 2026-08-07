import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isMidtransConfigured } from "@/lib/midtrans";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pesanan Anda di Nova Store.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login?next=/checkout");

  const testMode = !(await isMidtransConfigured());

  const savedAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, user.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lengkapi data di bawah untuk menyelesaikan pesanan Anda.
      </p>
      <div className="mt-6">
        <CheckoutForm
          testMode={testMode}
          user={{ name: user.name, email: user.email }}
          addresses={savedAddresses.map((a) => ({
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
      </div>
    </div>
  );
}
