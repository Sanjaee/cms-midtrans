import { logoutAction } from "@/lib/auth-actions";

export default async function LogoutPage() {
  await logoutAction();
  return null;
}
