"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  Heart,
  Star,
  MapPin,
  Lock,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Profil", icon: User },
  { href: "/account/orders", label: "Pesanan Saya", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "Ulasan Saya", icon: Star },
  { href: "/account/addresses", label: "Alamat", icon: MapPin },
  { href: "/account/security", label: "Keamanan", icon: Lock },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
              active && "bg-brand-gradient text-white hover:bg-brand-gradient",
            )}
          >
            <link.icon className="h-4 w-4" />
            <span className="hidden lg:inline">{link.label}</span>
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden lg:inline">Dashboard Admin</span>
        </Link>
      )}
    </nav>
  );
}
