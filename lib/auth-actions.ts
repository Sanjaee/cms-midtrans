"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  logActivity,
} from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { sendMail, layoutEmail } from "@/lib/mail";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  remember: z.boolean().optional(),
});

export async function registerAction(
  prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: string; devVerifyLink?: string }> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  if (existing.length) {
    return { error: "Email sudah terdaftar" };
  }

  const user = {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    password: await hashPassword(password),
    emailVerifyToken: generateId("verify"),
  };

  await db.insert(users).values(user);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${user.emailVerifyToken}`;

  const sent = await sendMail(
    user.email,
    "Verifikasi Email Anda",
    layoutEmail(
      "Verifikasi Email",
      `Halo <strong>${name}</strong>, terima kasih telah mendaftar di Zacode Store.<br/>Klik tombol di bawah untuk memverifikasi email Anda.`,
      { label: "Verifikasi Email", url: verifyUrl },
    ),
  );

  await logActivity(null, "register", "user", user.id, { email: user.email });

  if (!sent) {
    return {
      success: "Akun berhasil dibuat. Verifikasi email Anda untuk melanjutkan.",
      devVerifyLink: verifyUrl,
    };
  }
  return { success: "Akun berhasil dibuat. Link verifikasi telah dikirim ke email Anda." };
}

export async function loginAction(
  prev: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password, remember } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  if (!user || !user.password || !(await verifyPassword(password, user.password))) {
    return { error: "Email atau password salah" };
  }
  if (user.status !== "active") {
    return { error: "Akun Anda dinonaktifkan" };
  }

  const headersList = new Headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  await createSession(user.id, remember, undefined, ip);
  await logActivity(user.id, "login", "user", user.id);

  const next = formData.get("next")?.toString();
  if (next?.startsWith("/")) redirect(next);
  redirect(user.role === "admin" ? "/admin" : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(
  prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: string; devResetLink?: string }> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email || !z.string().email().safeParse(email).success) {
    return { error: "Email tidak valid" };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return { success: "Jika email terdaftar, link reset akan dikirim." };
  }

  const token = generateId("reset");
  await db.insert(passwordResetTokens).values({
    id: generateId(),
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset/${token}`;

  const sent = await sendMail(
    user.email,
    "Reset Password Anda",
    layoutEmail(
      "Reset Password",
      `Halo <strong>${user.name}</strong>, kami menerima permintaan reset password.<br/>Link ini berlaku selama 1 jam.`,
      { label: "Reset Password", url: resetUrl },
    ),
  );

  if (!sent) {
    return {
      success: "Jika email terdaftar, link reset akan dikirim.",
      devResetLink: resetUrl,
    };
  }
  return { success: "Link reset password telah dikirim ke email Anda." };
}

export async function resetPasswordAction(
  token: string,
  prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const password = formData.get("password")?.toString() || "";
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));
  if (!row || row.used || row.expiresAt < new Date()) {
    return { error: "Token reset tidak valid atau telah kedaluwarsa" };
  }

  await db
    .update(users)
    .set({ password: await hashPassword(password) })
    .where(eq(users.id, row.userId));
  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, row.id));

  return { success: "Password berhasil diubah. Silakan login." };
}

export async function verifyEmailAction(token: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.emailVerifyToken, token));
  if (!user) return false;
  await db
    .update(users)
    .set({ emailVerified: new Date(), emailVerifyToken: null })
    .where(eq(users.id, user.id));
  return true;
}
