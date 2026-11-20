
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  backHref,
  backLabel = "Volver",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 pb-4",
        "sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {backLabel}
          </Link>
        )}

        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground break-words">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:max-w-full">
          {actions}
        </div>
      )}
    </div>
  );
}
