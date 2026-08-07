import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <div className="bg-primary absolute left-1/4 top-0 h-80 w-80 rounded-full opacity-5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-primary opacity-5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-[size:28px_28px] opacity-40" />
      </div>
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold">Nova Store</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
