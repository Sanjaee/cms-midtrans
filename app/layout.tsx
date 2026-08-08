import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AnalyticsScripts } from "@/app/scripts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zacode Store — Belanja Premium Online",
    template: "%s | Zacode Store",
  },
  description:
    "Temukan produk premium pilihan dengan harga terbaik. Belanja mudah, aman, dan cepat di Zacode Store.",
  keywords: "zacode store, belanja online, produk premium",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Zacode Store",
    description:
      "Temukan produk premium pilihan dengan harga terbaik. Belanja mudah, aman, dan cepat.",
    type: "website",
    locale: "id_ID",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-full font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
