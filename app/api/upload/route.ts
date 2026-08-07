import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
]);
const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Silakan login" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "uploads";
  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 8MB" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".png";
  const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "");
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const dir = path.join(process.cwd(), "public", safeFolder);
  const filepath = path.join(dir, filename);

  try {
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, bytes);

    const url = `/${safeFolder}/${filename}`;
    await db.insert(media).values({
      id: generateId(),
      name: file.name,
      url,
      path: filepath,
      folder: safeFolder,
      mime: file.type,
      size: file.size,
      uploadedBy: user.id,
    });

    return NextResponse.json({ url, name: file.name, size: file.size });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload gagal" },
      { status: 500 },
    );
  }
}
