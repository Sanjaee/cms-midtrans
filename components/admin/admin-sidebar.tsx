"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  ShoppingCart,
  Ticket,
  Users,
  Star,
  Image,
  FileText,
  FolderOpen,
  Bell,
  History,
  Quote,
  HelpCircle,
  Settings,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/categories", label: "Kategori", icon: FolderTree },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Kupon", icon: Ticket },
  { href: "/admin/customers", label: "Pelanggan", icon: Users },
  { href: "/admin/reviews", label: "Review", icon: Star },
  { href: "/admin/banners", label: "Banner", icon: Image },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/media", label: "Media", icon: FolderOpen },
  { href: "/admin/notifications", label: "Notifikasi", icon: Bell },
  { href: "/admin/activity", label: "Aktivitas", icon: History },
  { href: "/admin/testimonials", label: "Testimoni", icon: Quote },
  { href: "/admin/faqs", label: "FAQ", icon: HelpCircle },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({
  open,
  setOpen,
  siteName,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  siteName: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">{siteName}</p>
              <p className="text-[10px] text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-brand-gradient text-white hover:bg-brand-gradient hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            ← Kembali ke toko
          </Link>
        </div>
      </aside>
    </>
  );
}
