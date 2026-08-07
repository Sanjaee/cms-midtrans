import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { TestimonialManager } from "@/components/admin/testimonial-manager";

export const metadata: Metadata = { title: "Manajemen Testimoni" };

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const rows = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  return <TestimonialManager items={rows} />;
}
