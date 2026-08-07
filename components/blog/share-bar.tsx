"use client";

import * as React from "react";
import { Link2, Check } from "lucide-react";
import { FacebookIcon, TwitterIcon, WhatsAppIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = React.useState(false);
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link disalin");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareItems = [
    { label: "WhatsApp", icon: WhatsAppIcon, href: `https://wa.me/?text=${encodedTitle}%20${encoded}` },
    { label: "Facebook", icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { label: "X", icon: TwitterIcon, href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}` },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bagikan:</span>
      {shareItems.map((s) => (
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
      ))}
      <Button variant="outline" size="icon-sm" onClick={copy} aria-label="Salin link">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
