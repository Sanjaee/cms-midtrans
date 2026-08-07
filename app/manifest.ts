import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nova Store — Belanja Premium Online",
    short_name: "Nova Store",
    description:
      "Temukan produk premium pilihan dengan harga terbaik. Belanja mudah, aman, dan cepat.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
