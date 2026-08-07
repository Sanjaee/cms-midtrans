import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Profil Saya" };

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSession();
  if (!user) return null;

  const stats = [
    { label: "Total Belanja", value: "-" },
    { label: "Pesanan", value: "-" },
    { label: "Wishlist", value: "-" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Halo, {user.name.split(" ")[0]}! 👋</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil dan aktivitas akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-card p-4 text-center shadow-sm"
          >
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          avatar: user.avatar,
        }}
      />
    </div>
  );
}
