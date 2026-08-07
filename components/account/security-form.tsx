"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/lib/account-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertSuccess } from "@/components/ui/alert";

export function SecurityForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const form = new FormData(e.currentTarget);
    const res = await updatePasswordAction({
      currentPassword: form.get("currentPassword")?.toString() || "",
      newPassword: form.get("newPassword")?.toString() || "",
    });
    setLoading(false);
    if (res?.success) {
      setSuccess(res.success);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(res?.error || "Gagal mengubah password");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Keamanan</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Kelola kata sandi akun Anda.
      </p>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Ganti Password</CardTitle>
          <CardDescription>
            Gunakan minimal 6 karakter dengan kombinasi huruf dan angka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4">
              <AlertSuccess>{success}</AlertSuccess>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input id="newPassword" name="newPassword" type="password" minLength={6} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Ganti Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
