"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, addresses } from "@/db/schema";
import { getSession, hashPassword, verifyPassword, logActivity } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(input: {
  name: string;
  phone?: string;
  bio?: string;
}) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };

  await db
    .update(users)
    .set({ name: input.name, phone: input.phone, bio: input.bio })
    .where(eq(users.id, user.id));
  await logActivity(user.id, "update_profile", "user", user.id);
  revalidatePath("/account");
  return { success: "Profil berhasil diperbarui" };
}

export async function updateAvatarAction(avatarUrl: string) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };
  await db
    .update(users)
    .set({ avatar: avatarUrl })
    .where(eq(users.id, user.id));
  revalidatePath("/account");
  return { success: "Foto profil diperbarui" };
}

export async function updatePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };
  if (input.newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter" };
  }
  if (user.password && !(await verifyPassword(input.currentPassword, user.password))) {
    return { error: "Password saat ini salah" };
  }
  await db
    .update(users)
    .set({ password: await hashPassword(input.newPassword) })
    .where(eq(users.id, user.id));
  return { success: "Password berhasil diubah" };
}

const addressSchema = z.object({
  label: z.string().optional(),
  name: z.string().min(2),
  phone: z.string().optional(),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function addAddressAction(input: {
  label?: string;
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode?: string;
  isDefault?: boolean;
}) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { error: "Data alamat tidak valid" };
  const data = parsed.data;

  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, user.id));
  }

  await db.insert(addresses).values({
    id: generateId(),
    userId: user.id,
    label: data.label || "Rumah",
    name: data.name,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    isDefault: data.isDefault || false,
  });

  revalidatePath("/account/addresses");
  return { success: "Alamat berhasil ditambahkan" };
}

export async function deleteAddressAction(addressId: string) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };
  await db
    .delete(addresses)
    .where(eq(addresses.id, addressId));
  revalidatePath("/account/addresses");
  return { success: "Alamat dihapus" };
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await getSession();
  if (!user) return { error: "Silakan login" };
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, addressId));
  revalidatePath("/account/addresses");
  return { success: "Alamat utama diperbarui" };
}
