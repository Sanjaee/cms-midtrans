import type { Metadata } from "next";
import { db } from "@/db";
import { postCategories } from "@/db/schema";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Tulis Artikel" };

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const cats = await db.select().from(postCategories);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tulis Artikel</h1>
      <PostForm categories={cats} />
    </div>
  );
}
