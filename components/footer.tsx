import Link from "next/link";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/icons";

interface FooterProps {
  settings: Record<string, string>;
}

export function Footer({ settings }: FooterProps) {
  const socials = [
    { href: settings.instagram, icon: InstagramIcon, label: "Instagram" },
    { href: settings.facebook, icon: FacebookIcon, label: "Facebook" },
    { href: settings.twitter, icon: TwitterIcon, label: "Twitter" },
    { href: settings.youtube, icon: YoutubeIcon, label: "Youtube" },
  ];

  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-lg text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">{settings.siteName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {settings.tagline}
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(
                (s) =>
                  s.href && (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      aria-label={s.label}
                    >
                      <s.icon className="h-4 w-4" />
                    </a>
                  ),
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              Belanja
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/products">Semua Produk</Link></li>
              <li><Link className="hover:text-foreground" href="/products?sort=popular">Terlaris</Link></li>
              <li><Link className="hover:text-foreground" href="/products?sort=newest">Terbaru</Link></li>
              <li><Link className="hover:text-foreground" href="/products?discount=1">Diskon</Link></li>
              <li><Link className="hover:text-foreground" href="/categories">Kategori</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              Bantuan
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/#faq">FAQ</Link></li>
              <li><Link className="hover:text-foreground" href="/#contact">Kontak</Link></li>
              <li><Link className="hover:text-foreground" href="/blog">Blog</Link></li>
              <li><Link className="hover:text-foreground" href="/auth/register">Daftar</Link></li>
              <li><Link className="hover:text-foreground" href="/account/orders">Lacak Pesanan</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              Kontak
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {settings.contactEmail}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {settings.contactPhone}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4" /> {settings.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. Hak cipta
            dilindungi.
          </p>
          <p>Dibuat dengan ❤️ di Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
