"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Berhasil berlangganan! Cek email Anda.");
      setEmail("");
    } else {
      const data = await res.json().catch(() => null);
      toast.error(data?.error || "Terjadi kesalahan");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          required
          placeholder="Masukkan email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 bg-white/10 pl-11 text-white placeholder:text-white/60 focus:ring-white/40"
        />
      </div>
      <Button size="lg" className="bg-white text-foreground hover:bg-white/90" disabled={loading}>
        {loading ? "Memproses..." : "Berlangganan"}
      </Button>
    </form>
  );
}
