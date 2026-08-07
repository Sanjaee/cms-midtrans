import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { generateId } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rl = rateLimit(`newsletter_${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan, coba lagi nanti" },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  }
  const { email } = parsed.data;

  await db
    .insert(newsletterSubscribers)
    .values({ id: generateId(), email: email.toLowerCase() })
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: { active: true },
    });

  return NextResponse.json({ ok: true });
}
