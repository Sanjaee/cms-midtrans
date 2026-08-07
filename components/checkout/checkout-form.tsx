"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  MapPin,
  Truck,
  CreditCard,
  Check,
} from "lucide-react";
import { useCart } from "@/store/cart-store";
import { createOrderAction } from "@/lib/order-actions";
import { COURIERS } from "@/lib/shipping-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { formatIDR, cn } from "@/lib/utils";
import { toast } from "sonner";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        opts: {
          onSuccess: (r: unknown) => void;
          onPending: (r: unknown) => void;
          onError: (r: unknown) => void;
          onClose: () => void;
        },
      ) => void;
    };
  }
}

const PROVINCES = [
  "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DI Yogyakarta",
  "Banten", "Bali", "Sumatera Utara", "Sumatera Barat", "Sumatera Selatan",
  "Riau", "Kepulauan Riau", "Kalimantan Barat", "Kalimantan Timur",
  "Sulawesi Selatan", "Sulawesi Utara", "Lampung", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur", "Papua", "Lainnya",
];

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, subtotal } = useCart();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [courierId, setCourierId] = React.useState("");
  const [serviceId, setServiceId] = React.useState("");

  const shippingCost = React.useMemo(() => {
    if (!courierId || !serviceId) return null;
    const courier = COURIERS.find((c) => c.id === courierId);
    const service = courier?.services.find((s) => s.id === serviceId);
    if (!service) return null;
    return service;
  }, [courierId, serviceId]);

  const total = subtotal() + (shippingCost?.cost || 0);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!courierId || !serviceId) {
      setError("Silakan pilih kurir pengiriman");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createOrderAction({
      items: items.map((i) => ({ id: i.productId, qty: i.qty })),
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString(),
      address: formData.get("address")?.toString() || "",
      city: formData.get("city")?.toString() || "",
      province: formData.get("province")?.toString() || "",
      postalCode: formData.get("postalCode")?.toString(),
      notes: formData.get("notes")?.toString(),
      courierId,
      serviceId,
      couponCode: undefined,
    });

    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    if (result.orderId) clearCart();

    if (result.snapToken) {
      const clientKey =
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
        "SB-Mid-client-placeholder";

      const loadSnap = (cb: () => void) => {
        if (window.snap) return cb();
        const script = document.createElement("script");
        script.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
        script.setAttribute("data-client-key", clientKey);
        script.onload = () => cb();
        script.onerror = () => {
          setLoading(false);
          setError("Gagal memuat metode pembayaran. Silakan coba lagi.");
          router.push(`/checkout/failed?order=${result.orderId}`);
        };
        document.body.appendChild(script);
      };

      loadSnap(() => {
        window.snap!.pay(result.snapToken as string, {
          onSuccess: () => {
            router.push(`/checkout/success?order=${result.orderId}`);
          },
          onPending: () => {
            router.push(
              `/checkout/failed?order=${result.orderId}&pending=1`,
            );
          },
          onError: () => {
            router.push(`/checkout/failed?order=${result.orderId}`);
          },
          onClose: () => {
            router.push(`/account/orders/${result.orderId}`);
          },
        });
      });
    } else {
      setLoading(false);
      toast.error(
        "Pesanan dibuat namun pembayaran gagal dimulai. Silakan retry pembayaran di halaman pesanan.",
      );
      router.push(`/account/orders/${result.orderId}`);
    }
  };

  if (!items.length && !loading) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Keranjang Anda kosong.{" "}
        <Link href="/products" className="text-primary underline">
          Mulai belanja
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="flex items-center gap-2 font-bold">
            <span className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">1</span>
            <User className="h-4 w-4 text-primary" /> Data Pembeli
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="Nama Anda" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">No. HP</Label>
              <Input id="phone" name="phone" type="tel" placeholder="08xxxxxxxxxx" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="flex items-center gap-2 font-bold">
            <span className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">2</span>
            <MapPin className="h-4 w-4 text-primary" /> Alamat Pengiriman
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea id="address" name="address" placeholder="Jalan, nomor rumah, RT/RW, kelurahan" required minLength={10} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provinsi</Label>
              <select
                id="province"
                name="province"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-card/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
              >
                <option value="">Pilih provinsi</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Kota/Kabupaten</Label>
              <Input id="city" name="city" placeholder="Kota" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Kode Pos</Label>
              <Input id="postalCode" name="postalCode" placeholder="12345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Input id="notes" name="notes" placeholder="Catatan untuk kurir" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="flex items-center gap-2 font-bold">
            <span className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">3</span>
            <Truck className="h-4 w-4 text-primary" /> Pilih Kurir
          </h3>
          <div className="mt-4 space-y-3">
            {COURIERS.map((courier) => (
              <div key={courier.id} className="rounded-xl border p-3">
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                      {courier.name.replace(/\s/g, "").slice(0, 3).toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold">{courier.name}</span>
                  </span>
                  <input
                    type="radio"
                    name="courier"
                    checked={courierId === courier.id}
                    onChange={() => {
                      setCourierId(courier.id);
                      setServiceId("");
                    }}
                    className="h-4 w-4 accent-orange-500"
                  />
                </label>
                {courierId === courier.id && (
                  <div className="mt-3 space-y-2">
                    {courier.services.map((s) => (
                      <label
                        key={s.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm transition-colors",
                          serviceId === s.id && "border-primary bg-primary/5",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {serviceId === s.id && <Check className="h-4 w-4 text-primary" />}
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground">{s.eta}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          {s.cost === 0 ? (
                            <span className="text-xs font-semibold text-emerald-500">GRATIS</span>
                          ) : (
                            <span className="font-semibold">{formatIDR(s.cost)}</span>
                          )}
                          <input
                            type="radio"
                            name="service"
                            value={s.id}
                            checked={serviceId === s.id}
                            onChange={() => setServiceId(s.id)}
                            className="h-4 w-4 accent-orange-500"
                          />
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div>
        <div className="rounded-2xl border bg-card p-6 soft-shadow lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2 font-bold">
            <CreditCard className="h-4 w-4 text-primary" /> Ringkasan Belanja
          </h3>
          <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.productId} className="flex items-center gap-3">
                <Image
                  src={i.image}
                  alt={i.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-cover"
                  unoptimized
                />
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.qty} × {formatIDR(i.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatIDR(i.price * i.qty)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatIDR(subtotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ongkir</span>
              <span className="font-semibold">
                {shippingCost ? formatIDR(shippingCost.cost) : "-"}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatIDR(total)}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="mt-5 w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Membuat Pesanan...
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pembayaran aman melalui Midtrans. QRIS, VA, e-wallet, & lainnya.
          </p>
        </div>
      </div>
    </form>
  );
}
