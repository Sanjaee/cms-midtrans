"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateProfileAction, updateAvatarAction } from "@/lib/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string | null; bio: string | null; avatar: string | null };
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await updateProfileAction({
      name: form.get("name")?.toString() || "",
      phone: form.get("phone")?.toString(),
      bio: form.get("bio")?.toString(),
    });
    setLoading(false);
    if (res?.success) {
      toast.success(res.success);
      router.refresh();
    } else {
      toast.error(res?.error || "Gagal memperbarui profil");
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      await updateAvatarAction(data.url);
      toast.success("Foto profil diperbarui");
      router.refresh();
    } else {
      toast.error(data.error || "Gagal upload");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto Profil</CardTitle>
          <CardDescription>Upload foto profil Anda</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => document.getElementById("avatar-input")?.click()}
            >
              {uploading ? "Mengupload..." : "Ubah Foto"}
            </Button>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadAvatar}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Perbarui informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" name="name" defaultValue={user.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input id="phone" name="phone" defaultValue={user.phone || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={user.bio || ""}
                placeholder="Ceritakan tentang diri Anda (opsional)"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
