"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ActionButton({
  action,
  children,
  variant = "outline",
  size = "sm",
  className,
  refresh = true,
  confirmText,
  disabled,
}: {
  action: () => Promise<{ error?: string; success?: string } | void>;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
  refresh?: boolean;
  confirmText?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const run = async () => {
    if (confirmText && !window.confirm(confirmText)) return;
    setLoading(true);
    const res = await action();
    setLoading(false);
    if (res && "error" in res && res.error) {
      toast.error(res.error);
    } else if (res && "success" in res && res.success) {
      toast.success(res.success);
    }
    if (refresh) router.refresh();
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={run}
      disabled={loading || disabled}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </Button>
  );
}
