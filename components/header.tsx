"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  ShoppingBag,
  Heart,
  User,
  X,
  Sparkles,
  Search,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search-command";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  } | null;
  siteName: string;
}

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
  { href: "/categories", label: "Kategori" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Kontak" },
];

export function Header({ user, siteName }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const wishlistCount = useWishlist((s) => s.items.length);

  const initials = (user?.name || "N")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand-gradient overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap py-1.5 text-xs font-medium text-white">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 pr-8">
              <span>GRATIS ONGKIR min. belanja Rp200.000</span>
              <Sparkles className="h-3 w-3" />
              <span>DISKON 20% SEMUA PRODUK NEW ARRIVAL</span>
              <Sparkles className="h-3 w-3" />
              <span>GARANSI ORIGINAL 100%</span>
              <Sparkles className="h-3 w-3" />
            </span>
          ))}
        </div>
      </div>

      <div className="glass border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:block">
              {siteName}
            </span>
          </Link>

          <nav className="mx-4 hidden flex-1 items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    active && "bg-accent text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden md:block">
            <SearchCommand />
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => router.push("/products?focus=search")}
              aria-label="Cari"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push(user ? "/account/wishlist" : "/auth/login")}
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push("/cart")}
              aria-label="Keranjang"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="h-4 w-4" /> Akun Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <ShoppingBag className="h-4 w-4" /> Pesanan Saya
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/logout" className="text-destructive">
                      <LogOut className="h-4 w-4" /> Keluar
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
                <Link href="/auth/login">Masuk</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="glass absolute inset-y-0 left-0 flex w-72 flex-col gap-2 border-r p-4 animate-in slide-in-from-left">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold">{siteName}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2">
              <SearchCommand />
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  Masuk
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
