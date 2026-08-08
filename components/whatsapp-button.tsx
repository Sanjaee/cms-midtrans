"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ number }: { number?: string }) {
  const phone = number || "6281234567890";
  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(
        "Halo, saya ingin bertanya tentang produk Zacode Store",
      )}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition-transform hover:scale-110"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
