import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { desc, eq, isNull, sql, and } from "drizzle-orm";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { formatIDR } from "@/lib/utils";
import { deleteProductAction } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Manajemen Produk" };

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const catRows = await db.select().from(categories);

  const conditions = [isNull(products.deletedAt)];
  if (sp.q) {
    conditions.push(
      sql`(${products.name} ILIKE ${`%${sp.q}%`} OR ${products.sku} ILIKE ${`%${sp.q}%`})`,
    );
  }
  if (sp.status && sp.status !== "all") {
    conditions.push(eq(products.status, sp.status as never));
  }

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));

  const catMap = new Map(catRows.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} produk ·{" "}
            <Link href="/admin/products/trash" className="text-primary hover:underline">
              Tempat sampah
            </Link>
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Tambah Produk
          </Link>
        </Button>
      </div>

      <form className="flex max-w-md gap-2" action="/admin/products">
        <Input
          name="q"
          placeholder="Cari produk..."
          defaultValue={sp.q}
          className="bg-card"
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="rounded-2xl border bg-card soft-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={p.thumbnail || "/placeholders/1.svg"}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                      unoptimized
                    />
                    <div>
                      <p className="line-clamp-1 font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku || p.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {p.categoryId ? catMap.get(p.categoryId) || "-" : "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {p.salePrice && p.salePrice < p.price ? (
                    <>
                      <span className="font-semibold text-primary">
                        {formatIDR(p.salePrice)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        {formatIDR(p.price)}
                      </span>
                    </>
                  ) : (
                    formatIDR(p.price)
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={p.stock > 10 ? "success" : p.stock > 0 ? "warning" : "destructive"}
                  >
                    {p.stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.status === "published" ? "success" : p.status === "draft" ? "warning" : "secondary"
                    }
                  >
                    {p.status}
                  </Badge>
                  {p.featured && (
                    <Badge variant="brand" className="ml-1">
                      Unggulan
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton
                      action={() => deleteProductAction(p.id)}
                      confirmText="Produk akan dipindahkan ke tempat sampah dan tidak tampil di toko."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6} className="p-10 text-center text-muted-foreground">
                  Tidak ada produk.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
