import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, gt, isNull } from "drizzle-orm";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, sessions, activityLogs, type User } from "@/db/schema";
import { generateId } from "@/lib/utils";

export const SESSION_COOKIE = "nova_session";
const SESSION_HOURS = 12;
const REMEMBER_DAYS = 30;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(
  userId: string,
  remember = false,
  userAgent?: string,
  ip?: string,
) {
  const token = generateId("sess");
  const expiresAt = new Date(
    Date.now() +
      (remember ? REMEMBER_DAYS : SESSION_HOURS) * 60 * 60 * 1000,
  );
  await db.insert(sessions).values({
    id: generateId(),
    userId,
    token,
    expiresAt,
    remember,
    userAgent,
    ip,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), lastLoginIp: ip })
    .where(eq(users.id, userId));
  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, session.userId), eq(users.status, "active")));
  if (!user) return null;

  void db
    .update(sessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(sessions.id, session.id));

  return user;
});

export async function requireUser() {
  const user = await getSession();
  if (!user) redirect("/auth/login?next=/account");
  return user;
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user) redirect("/auth/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}

export async function logActivity(
  userId: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  details?: unknown,
) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await db.insert(activityLogs).values({
      id: generateId(),
      userId,
      action,
      entity,
      entityId,
      details,
      ip,
    });
  } catch {
    // noop
  }
}

export async function getLoginHistory(userId: string, limit = 10) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(sessions.lastActivityAt)
    .limit(limit);
}
