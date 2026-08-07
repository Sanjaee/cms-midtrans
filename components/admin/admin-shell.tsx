"use client";

import * as React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function AdminShell({
  children,
  user,
  notifications,
  siteName,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; avatar: string | null };
  notifications: Notification[];
  siteName: string;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} siteName={siteName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          user={user}
          notifications={notifications}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
