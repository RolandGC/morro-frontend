import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 text-center",
        compact ? "py-6" : "py-10",
        className
      )}
    >
      <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <p className="text-sm font-medium text-foreground">{title}</p>

      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
