import { redirect } from "next/navigation";
import { desc, eq, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/auth/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  const [settings, rows] = await Promise.all([
    getSettings(),
    db
      .select()
      .from(notifications)
      .where(isNull(notifications.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20),
  ]);

  return (
    <AdminShell
      siteName={settings.siteName || "Zacode Store"}
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }}
      notifications={rows.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))}
    >
      {children}
    </AdminShell>
  );
}
