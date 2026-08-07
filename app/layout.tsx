import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AnalyticsScripts } from "@/app/scripts";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-nova",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nova Store — Belanja Premium Online",
    template: "%s | Nova Store",
  },
  description:
    "Temukan produk premium pilihan dengan harga terbaik. Belanja mudah, aman, dan cepat di Nova Store.",
  keywords: "nova store, belanja online, produk premium",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Nova Store",
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
        className={`${jakarta.variable} min-h-full font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
