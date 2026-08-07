import type { Metadata } from "next";
import { SecurityForm } from "@/components/account/security-form";

export const metadata: Metadata = { title: "Keamanan" };

export default function SecurityPage() {
  return <SecurityForm />;
}
