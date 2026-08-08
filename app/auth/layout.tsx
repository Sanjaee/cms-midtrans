import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold">Zacode Store</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
