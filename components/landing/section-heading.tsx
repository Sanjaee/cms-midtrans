import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
