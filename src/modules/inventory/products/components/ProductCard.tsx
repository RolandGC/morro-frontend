import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Product, ProductUnit } from "../types/produc.type";

interface ProductCardProps {
    product: Product;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
    quantity?: number;
    onChangeQuantity?: (q: number) => void;
    units?: ProductUnit[];
    selectedUnitId?: string;
    onSelectUnit?: (unitId: string) => void;
    unitPrice?: number;
    onChangeUnitPrice?: (q: number) => void;
    availableStock: number;
}

/**
 * Línea del carrito.
 * Se reorganizó en dos niveles: identificación + total arriba, controles
 * de cantidad y precio abajo. Mantiene exactamente los mismos callbacks
 * que la versión anterior.
 */
export function ProductCard({
    product,
    onIncrease,
    onDecrease,
    onRemove,
    quantity = 0,
    onChangeQuantity,
    units,
    selectedUnitId,
    onSelectUnit,
    unitPrice,
    onChangeUnitPrice,
    availableStock,
}: ProductCardProps) {
    const unitList = units ?? product.product_units ?? [];
    const selectedUnit = unitList.find((unit) => unit.id === selectedUnitId);
    const lineTotal = Number(quantity ?? 0) * Number(unitPrice ?? 0);
    const meta = [product.brands?.name, product.model]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="rounded-lg border bg-card p-3 transition-colors hover:border-primary/30">
            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-foreground">
                            {product.name}
                        </h3>

                        {product.regime && (
                            <span
                                className={cn(
                                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                    product.regime === "zofra"
                                        ? "bg-success/10 text-success"
                                        : "bg-info/10 text-info"
                                )}
                            >
                                {product.regime}
                            </span>
                        )}
                    </div>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {meta || "Sin marca ni modelo"}
                    </p>
                </div>

                <div className="shrink-0 text-right">
                    <p className="money text-sm font-semibold text-foreground">
                        {formatCurrency(lineTotal)}
                    </p>

                    {/* <p className="money mt-0.5 text-[11px] text-muted-foreground">
                        {quantity} × {formatCurrency(unitPrice ?? 0)}
                    </p> */}
                    {/* Stock disponible */}
                    <div className="ml-auto text-right">
                        <span
                            className={cn(
                                "inline-flex h-6 items-center rounded-sm px-2.5 text-xs font-semibold tabular-nums",
                                availableStock <= 0
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            Stock: {availableStock} unid
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={onRemove}
                    aria-label={`Quitar ${product.name} del carrito`}
                    className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-3 border-t pt-3">
                {/* Cantidad */}
                <div>
                    <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Cantidad
                    </span>

                    <div className="flex h-9 items-center rounded-lg border bg-background">
                        <button
                            type="button"
                            onClick={onDecrease}
                            disabled={quantity <= 1}
                            aria-label="Disminuir cantidad"
                            className="flex h-full w-9 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Minus className="size-4" aria-hidden="true" />
                        </button>

                        <input
                            type="number"
                            inputMode="numeric"
                            value={quantity}
                            min={1}
                            aria-label={`Cantidad de ${product.name}`}
                            onChange={(e) =>
                                onChangeQuantity?.(Number(e.target.value))
                            }
                            className="h-full w-12 border-x bg-transparent text-center text-sm font-semibold tabular-nums outline-none focus-visible:bg-accent"
                        />

                        <button
                            type="button"
                            onClick={onIncrease}
                            aria-label="Aumentar cantidad"
                            className="flex h-full w-9 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Unidad */}
                <div>
                    <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Unidad
                    </span>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 min-w-20 justify-between gap-1.5 px-2.5 font-medium"
                            >
                                <span className="truncate">
                                    {selectedUnit?.name ?? "Unidad"}
                                </span>
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" className="min-w-36">
                            {unitList.map((unit) => (
                                <DropdownMenuItem
                                    key={unit.id}
                                    onSelect={() => onSelectUnit?.(unit.id)}
                                    className={cn(
                                        "cursor-pointer justify-between",
                                        selectedUnitId === unit.id &&
                                        "font-semibold text-primary"
                                    )}
                                >
                                    <span>{unit.name}</span>
                                    <span className="text-[11px] text-muted-foreground">
                                        ×{unit.conversion_factor}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Precio unitario */}
                <div className="min-w-28 flex-1">
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        Precio unitario
                    </label>

                    <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            S/
                        </span>

                        <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="any"
                            value={unitPrice || ""}
                            placeholder="0"
                            aria-label={`Precio unitario de ${product.name}`}
                            onChange={(e) => {
                                const value = e.target.value;

                                onChangeUnitPrice?.(
                                    value === "" ? 0 : Number(value)
                                );
                            }}
                            className="money h-9 w-full rounded-lg border bg-background pl-7 pr-2 text-right text-sm font-medium outline-none transition focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
