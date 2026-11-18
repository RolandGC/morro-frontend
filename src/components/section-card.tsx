import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  /**
   * Permite que el contenido maneje su propio scroll (paneles del POS).
   */
  fill?: boolean;
}

/**
 * Contenedor de sección reutilizable.
 * Unifica bordes, radios, sombras y jerarquía tipográfica en todos los
 * módulos sin depender del color primario como fondo.
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  children,
  className,
  headerClassName,
  bodyClassName,
  fill = false,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        fill && "min-h-0",
        className
      )}
    >
      {(title || actions || badge) && (
        <header
          className={cn(
            "flex items-start justify-between gap-3 border-b bg-card px-4 py-3",
            headerClassName
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            )}

            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>

          {(actions || badge) && (
            <div className="flex shrink-0 items-center gap-2">
              {badge}
              {actions}
            </div>
          )}
        </header>
      )}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col p-4",
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
