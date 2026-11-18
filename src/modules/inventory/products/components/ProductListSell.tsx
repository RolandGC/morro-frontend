import React from "react";
import { Package } from "lucide-react";

import { Product } from "@/modules/inventory/products/types/produc.type";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";

interface ProductSearchItemProps {
    product: Product;
    onSelect: (product: Product) => void;
    availableStock: number;
}

const regimeLabel: Record<string, string> = {
    zofra: "ZOFRA",
    general: "General",
};

export function ProductSearchItem({
    product,
    onSelect,
    availableStock,
}: ProductSearchItemProps) {
    const outOfStock = availableStock <= 0;
    const price = Number(product.unit_price ?? product.price ?? 0);
    const meta = [product.brands?.name, product.model]
        .filter(Boolean)
        .join(" · ");

    return (
        <button
            type="button"
            disabled={outOfStock}
            onClick={() => onSelect(product)}
            aria-label={`Agregar ${product.name}${outOfStock ? " (sin stock)" : ""}`}
            className={cn(
                "group flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors",
                "hover:border-primary/40 hover:bg-accent/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/15",
                outOfStock && "cursor-not-allowed opacity-55 hover:border-border hover:bg-card"
            )}
        >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Package className="size-5" aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {product.name}
                    </span>

                    {product.regime && (
                        <span
                            className={cn(
                                "hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline",
                                product.regime === "zofra"
                                    ? "bg-success/10 text-success"
                                    : "bg-info/10 text-info"
                            )}
                        >
                            {regimeLabel[product.regime] ?? product.regime}
                        </span>
                    )}
                </span>

                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {meta || "Sin marca ni modelo"}
                </span>
            </span>

            <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="money text-sm font-semibold text-foreground">
                    {formatCurrency(price)}
                </span>

                <span
                    className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                        outOfStock
                            ? "bg-destructive/10 text-destructive"
                            : availableStock <= 5
                                ? "bg-warning/15 text-warning-foreground dark:text-warning"
                                : "bg-muted text-muted-foreground"
                    )}
                >
                    {outOfStock
                        ? "Agotado"
                        : `${formatNumber(availableStock)} disp.`}
                </span>
            </span>
        </button>
    );
}
