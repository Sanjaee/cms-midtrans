"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { forgotPasswordAction } from "@/lib/auth-actions";
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

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {});

  return (
    <Card className="soft-shadow">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email Anda untuk menerima link reset password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success && (
          <div className="mb-4">
            <AlertSuccess>{state.success}</AlertSuccess>
            {state.devResetLink && (
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <p className="font-semibold mb-1">Mode pengembangan (SMTP belum dikonfigurasi):</p>
                <a href={state.devResetLink} className="underline break-all">{state.devResetLink}</a>
              </div>
            )}
          </div>
        )}
        <form action={action} className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Mengirim..." : "Kirim Link Reset"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            ← Kembali ke login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
