import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { desc, eq, sql, and } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { deletePostAction } from "@/lib/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Manajemen Blog" };

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const conditions = [];
  if (sp.q) conditions.push(sql`${posts.title} ILIKE ${`%${sp.q}%`}`);
  if (sp.status && sp.status !== "all") conditions.push(eq(posts.status, sp.status as never));

  const rows = conditions.length
    ? await db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.createdAt))
    : await db.select().from(posts).orderBy(desc(posts.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-sm text-muted-foreground">Kelola artikel blog toko.</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" /> Tulis Artikel
          </Link>
        </Button>
      </div>

      <form className="flex max-w-md gap-2" action="/admin/blog">
        <Input name="q" placeholder="Cari artikel..." defaultValue={sp.q} className="bg-card" />
        <Button type="submit" variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
      </form>

      <div className="rounded-2xl border bg-card soft-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artikel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image src={p.thumbnail || "/placeholders/1.svg"} alt={p.title} width={48} height={32} className="h-8 w-12 rounded object-cover" unoptimized />
                    <div>
                      <Link href={`/blog/${p.slug}`} className="line-clamp-1 font-medium hover:text-primary">{p.title}</Link>
                      <p className="text-xs text-muted-foreground">{p.authorName}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "published" ? "success" : p.status === "scheduled" ? "info" : "warning"}>
                    {p.status}
                  </Badge>
                  {p.featured && <Badge variant="brand" className="ml-1">Unggulan</Badge>}
                </TableCell>
                <TableCell className="text-sm">{p.views}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.publishedAt ? formatDate(p.publishedAt) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/blog/${p.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton action={deletePostAction.bind(null, p.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} className="p-10 text-center text-muted-foreground">
                  Belum ada artikel.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
