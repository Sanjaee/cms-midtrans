"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Search, Trash2, FolderOpen } from "lucide-react";
import { deleteMediaAction } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  folder: string;
  mime: string;
  size: number;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [folder, setFolder] = React.useState("all");
  const [selected, setSelected] = React.useState<MediaItem | null>(null);

  const folders = Array.from(new Set(items.map((i) => i.folder)));

  const upload = async (files: FileList | File[]) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder === "all" ? "uploads" : folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.url) toast.error(data.error || "Gagal upload " + file.name);
    }
    setUploading(false);
    router.refresh();
    toast.success("Upload selesai");
  };

  const filtered = items.filter((i) => {
    const matchQuery = i.name.toLowerCase().includes(query.toLowerCase());
    const matchFolder = folder === "all" || i.folder === folder;
    return matchQuery && matchFolder;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Media Manager</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} file · upload, cari, dan kelola media.
          </p>
        </div>
        <Button
          disabled={uploading}
          onClick={() => document.getElementById("media-input")?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Mengupload..." : "Upload File"}
        </Button>
        <input
          id="media-input"
          type="file"
          multiple
          accept="image/*,video/mp4"
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <p className="text-sm text-muted-foreground">
          Drag & drop file ke sini atau klik tombol upload
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari file..." className="pl-9 bg-card" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={folder === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFolder("all")}
          >
            <FolderOpen className="h-3.5 w-3.5" /> Semua
          </Button>
          {folders.map((f) => (
            <Button
              key={f}
              variant={folder === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFolder(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
          >
            {item.mime?.startsWith("video") ? (
              <video src={item.url} className="h-full w-full object-cover" />
            ) : (
              <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="truncate text-[10px] text-white">{item.name}</p>
            </div>
            {item.folder !== "uploads" && (
              <Badge className="absolute left-1 top-1 bg-black/60 text-[9px] text-white">
                {item.folder}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg rounded-2xl border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
              {selected.mime?.startsWith("video") ? (
                <video src={selected.url} controls className="h-full w-full object-contain" />
              ) : (
                <Image src={selected.url} alt={selected.name} fill className="object-contain" unoptimized />
              )}
            </div>
            <p className="truncate text-sm font-semibold">{selected.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(selected.size)} · {selected.folder}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(selected.url);
                  toast.success("URL disalin");
                }}
              >
                Salin URL
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={async () => {
                  await deleteMediaAction(selected.id);
                  setSelected(null);
                  router.refresh();
                  toast.success("File dihapus");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
