"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  target: string | number | Date;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function Countdown({ target, className, size = "md" }: CountdownProps) {
  const targetTime =
    typeof target === "number"
      ? target
      : new Date(target instanceof Date ? target : String(target)).getTime();
  const [time, setTime] = useState(() => getRemaining(targetTime));

  useEffect(() => {
    const interval = setInterval(() => setTime(getRemaining(targetTime)), 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const box =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
        ? "h-16 w-16 text-xl"
        : "h-12 w-12 text-sm";

  const units = [
    { label: "Hari", value: time.days },
    { label: "Jam", value: time.hours },
    { label: "Menit", value: time.minutes },
    { label: "Detik", value: time.seconds },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {units.map((u) => (
        <div key={u.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                box,
                "flex items-center justify-center rounded-lg bg-card/10 font-bold tabular-nums backdrop-blur border border-white/10",
              )}
            >
              {String(u.value).padStart(2, "0")}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/60">
              {u.label}
            </span>
          </div>
          {u.label !== "Detik" && (
            <span className="pb-4 font-bold text-white/50">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
