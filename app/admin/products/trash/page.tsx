import type { Metadata } from "next";
import Image from "next/image";
import { desc, isNull, not } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatIDR } from "@/lib/utils";
import { restoreProductAction, hardDeleteProductAction } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActionButton } from "@/components/admin/action-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Tempat Sampah" };

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const rows = await db
    .select()
    .from(products)
    .where(not(isNull(products.deletedAt)))
    .orderBy(desc(products.deletedAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tempat Sampah</h1>
        <p className="text-sm text-muted-foreground">
          Produk yang dihapus. Pulihkan atau hapus permanen.
        </p>
      </div>

      <div className="rounded-2xl border bg-card soft-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Dihapus</TableHead>
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
                      className="h-10 w-10 rounded-lg object-cover opacity-60"
                      unoptimized
                    />
                    <p className="font-medium">{p.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{formatIDR(p.price)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.deletedAt?.toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ActionButton action={restoreProductAction.bind(null, p.id)}>
                      <RotateCcw className="h-3.5 w-3.5" /> Pulihkan
                    </ActionButton>
                    <DeleteButton
                      action={hardDeleteProductAction.bind(null, p.id)}
                      label="Hapus Permanen"
                      confirmTitle="Hapus permanen produk ini?"
                      confirmText="Tindakan ini tidak dapat dibatalkan."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={4} className="p-10 text-center text-muted-foreground">
                  Tempat sampah kosong.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
