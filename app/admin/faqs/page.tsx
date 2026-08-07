import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { FaqManager } from "@/components/admin/faq-manager";

export const metadata: Metadata = { title: "Manajemen FAQ" };

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder));
  return <FaqManager items={rows} />;
}
