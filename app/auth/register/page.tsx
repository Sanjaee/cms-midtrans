"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { registerAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertSuccess } from "@/components/ui/alert";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [state, action, pending] = useActionState(registerAction, {});

  return (
    <Card className="soft-shadow">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Buat Akun</CardTitle>
        <CardDescription>
          Daftar untuk mulai belanja di Nova Store
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success && (
          <div className="mb-4">
            <AlertSuccess>{state.success}</AlertSuccess>
            {state.devVerifyLink && (
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <p className="font-semibold mb-1">Mode pengembangan (SMTP belum dikonfigurasi):</p>
                <a href={state.devVerifyLink} className="underline break-all">{state.devVerifyLink}</a>
              </div>
            )}
          </div>
        )}
        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" placeholder="Nama Anda" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Memproses..." : "Daftar"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-primary hover:underline"
          >
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
