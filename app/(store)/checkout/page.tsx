import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pesanan Anda di Nova Store.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getSession();
  if (!user) redirect("/auth/login?next=/checkout");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Lengkapi data di bawah untuk menyelesaikan pesanan Anda.
      </p>
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
