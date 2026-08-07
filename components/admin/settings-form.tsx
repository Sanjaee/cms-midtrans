"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateSettingsAction } from "@/lib/settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const FIELD_GROUPS: Record<string, { label: string; key: string; type?: string; textarea?: boolean; placeholder?: string }[]> = {
  umum: [
    { label: "Nama Toko", key: "siteName" },
    { label: "Tagline", key: "tagline" },
    { label: "Email Kontak", key: "contactEmail" },
    { label: "Telepon Kontak", key: "contactPhone" },
    { label: "WhatsApp", key: "whatsapp", placeholder: "62xxxxxxxxxx" },
    { label: "Alamat", key: "address", textarea: true },
  ],
  sosial: [
    { label: "Instagram", key: "instagram" },
    { label: "TikTok", key: "tiktok" },
    { label: "Twitter / X", key: "twitter" },
    { label: "Facebook", key: "facebook" },
    { label: "YouTube", key: "youtube" },
    { label: "Google Maps Embed", key: "googleMapsEmbed", textarea: true },
  ],
  seo: [
    { label: "SEO Title", key: "seoTitle" },
    { label: "SEO Description", key: "seoDescription", textarea: true },
    { label: "SEO Keywords", key: "seoKeywords" },
  ],
  analitik: [
    { label: "Google Analytics ID", key: "googleAnalyticsId", placeholder: "G-XXXXXXXXXX" },
    { label: "Meta Pixel ID", key: "metaPixelId" },
  ],
  toko: [
    { label: "Gratis Ongkir Min. Belanja (Rp)", key: "freeShippingThreshold", type: "number" },
    { label: "Catatan Pengiriman", key: "shippingNote", textarea: true },
  ],
  pembayaran: [
    { label: "Midtrans Server Key", key: "midtransServerKey", placeholder: "SB-Mid-server-..." },
    { label: "Midtrans Client Key", key: "midtransClientKey", placeholder: "SB-Mid-client-..." },
  ],
  smtp: [
    { label: "SMTP Host", key: "smtpHost" },
    { label: "SMTP Port", key: "smtpPort" },
    { label: "SMTP User", key: "smtpUser" },
    { label: "SMTP Password", key: "smtpPass", type: "password" },
    { label: "SMTP From", key: "smtpFrom" },
  ],
};

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<Record<string, string>>(settings);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateSettingsAction(form);
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal menyimpan");
    }
  };

  const groupSettings = ["umum", "sosial", "seo", "analitik", "toko", "pembayaran", "smtp"];
  const groupLabels: Record<string, string> = {
    umum: "Umum",
    sosial: "Sosial & Kontak",
    seo: "SEO",
    analitik: "Analytics & Pixel",
    toko: "Toko",
    pembayaran: "Midtrans",
    smtp: "SMTP",
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-sm text-muted-foreground">Kelola identitas dan konfigurasi toko.</p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Semua
        </Button>
      </div>

      <Tabs defaultValue="umum">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1.5">
          {groupSettings.map((g) => (
            <TabsTrigger key={g} value={g}>{groupLabels[g]}</TabsTrigger>
          ))}
        </TabsList>

        {groupSettings.map((g) => (
          <TabsContent key={g} value={g}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{groupLabels[g]}</CardTitle>
                <CardDescription>Atur pengaturan {groupLabels[g].toLowerCase()} toko Anda.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {FIELD_GROUPS[g].map((f) => (
                  <div key={f.key} className={f.textarea ? "sm:col-span-2" : ""}>
                    <Label>{f.label}</Label>
                    {f.textarea ? (
                      <Textarea
                        rows={3}
                        value={form[f.key] || ""}
                        onChange={(e) => set(f.key, e.target.value)}
                      />
                    ) : (
                      <Input
                        type={f.type || "text"}
                        value={form[f.key] || ""}
                        placeholder={f.placeholder}
                        onChange={(e) => set(f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maintenance Mode</CardTitle>
          <CardDescription>
            Ketika aktif, toko hanya dapat diakses oleh admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.maintenanceMode === "true"}
              onChange={(e) => set("maintenanceMode", e.target.checked ? "true" : "false")}
              className="h-4 w-4 accent-primary"
            />
            Aktifkan mode pemeliharaan
          </label>
        </CardContent>
      </Card>
    </form>
  );
}
