import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { MaintenanceScreen } from "@/components/maintenance-screen";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings] = await Promise.all([getSession(), getSettings()]);

  if (settings.maintenanceMode === "true" && user?.role !== "admin") {
    return <MaintenanceScreen />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={
          user
            ? {
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
              }
            : null
        }
        siteName={settings.siteName || "Zacode Store"}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton number={settings.whatsapp} />
    </div>
  );
}
