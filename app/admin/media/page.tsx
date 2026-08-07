import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { MediaManager } from "@/components/admin/media-manager";

export const metadata: Metadata = { title: "Media Manager" };

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const rows = await db.select().from(media).orderBy(desc(media.createdAt));
  return (
    <MediaManager
      items={rows.map((m) => ({
        id: m.id,
        name: m.name,
        url: m.url,
        folder: m.folder,
        mime: m.mime || "",
        size: m.size,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
