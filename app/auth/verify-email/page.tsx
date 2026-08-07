import { verifyEmailAction } from "@/lib/auth-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let success = false;
  if (token) {
    success = await verifyEmailAction(token);
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {success ? "Email Terverifikasi 🎉" : "Verifikasi Gagal"}
        </CardTitle>
        <CardDescription>
          {success
            ? "Terima kasih! Email Anda telah berhasil diverifikasi."
            : "Token verifikasi tidak valid atau sudah digunakan."}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild className="w-full" size="lg">
          <Link href="/auth/login">Masuk ke Akun</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
