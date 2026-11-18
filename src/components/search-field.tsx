import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SearchFieldProps
  extends Omit<React.ComponentProps<"input">, "size"> {
  icon?: LucideIcon;
  trailing?: React.ReactNode;
  hint?: string;
  containerClassName?: string;
}

/**
 * Campo de búsqueda/escaneo con icono, atajo visible y altura táctil
 * consistente. Mantiene el ref para el enfoque automático del lector.
 */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      icon: Icon,
      trailing,
      hint,
      className,
      containerClassName,
      ...props
    },
    ref
  ) {
    return (
      <div className={cn("relative", containerClassName)}>
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        )}

        <input
          ref={ref}
          className={cn(
            "h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground shadow-[0_1px_1px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50",
            (trailing || hint) && "pr-16",
            className
          )}
          {...props}
        />

        {trailing ??
          (hint ? (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
              {hint}
            </kbd>
          ) : null)}
      </div>
    );
  }
);
