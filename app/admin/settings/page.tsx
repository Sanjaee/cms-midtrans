import type { Metadata } from "next";
import { getSettings, ensureDefaultSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "Pengaturan" };

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await ensureDefaultSettings();
  const settings = await getSettings();
  return <SettingsForm settings={settings} />;
}
