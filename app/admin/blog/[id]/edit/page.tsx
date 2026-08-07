import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, postCategories } from "@/db/schema";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Edit Artikel" };

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) notFound();
  const cats = await db.select().from(postCategories);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Artikel</h1>
      <PostForm post={post} categories={cats} />
    </div>
  );
}
