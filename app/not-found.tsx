import Link from "next/link";
import { SearchX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-gradient text-8xl font-bold">404</p>
      <h1 className="mt-4 text-2xl font-bold">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> Beranda
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">
            <SearchX className="h-4 w-4" /> Jelajahi Produk
          </Link>
        </Button>
      </div>
    </div>
  );
}
