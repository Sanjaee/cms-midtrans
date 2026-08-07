import Link from "next/link";
import { Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MaintenanceScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 -z-10">
        <div className="bg-primary absolute left-1/4 top-0 h-80 w-80 rounded-full opacity-20 blur-[120px]" />
      </div>
      <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Sedang Pemeliharaan</h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Kami sedang melakukan perbaikan untuk meningkatkan pengalaman belanja
        Anda. Silakan kembali beberapa saat lagi.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Wrench className="h-4 w-4 animate-pulse-slow" />
        Terima kasih atas kesabaran Anda
      </div>
      <Button asChild className="mt-6" variant="outline">
        <Link href="/auth/login">Login Admin</Link>
      </Button>
    </div>
  );
}
