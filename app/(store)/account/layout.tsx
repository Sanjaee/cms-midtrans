import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AccountNav } from "@/components/account/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/auth/login?next=/account");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <div className="mb-4 hidden items-center gap-3 lg:flex">
            <div className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <AccountNav isAdmin={user.role === "admin"} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
