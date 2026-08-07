"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { upsertSettings, ensureDefaultSettings } from "@/lib/settings";

export async function updateSettingsAction(values: Record<string, string>) {
  const user = await getSession();
  if (!user || user.role !== "admin") return { error: "Unauthorized" };

  const safeValues: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") safeValues[key] = value.trim();
  }
  await upsertSettings(safeValues);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: "Pengaturan berhasil disimpan" };
}

export async function initSettingsAction() {
  await ensureDefaultSettings();
  return { ok: true };
}
