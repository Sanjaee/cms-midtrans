"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/lib/auth-actions";
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

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = React.use(params);
  const [state, action, pending] = useActionState(
    (prev: unknown, formData: FormData) =>
      resetPasswordAction(token, prev, formData),
    {},
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Buat password baru untuk akun Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.success && (
          <div className="mb-4">
            <AlertSuccess>{state.success}</AlertSuccess>
            <Button asChild className="mt-4 w-full" size="lg">
              <Link href="/auth/login">Login Sekarang</Link>
            </Button>
          </div>
        )}
        {!state.success && (
          <form action={action} className="space-y-4">
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Memproses..." : "Simpan Password Baru"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
