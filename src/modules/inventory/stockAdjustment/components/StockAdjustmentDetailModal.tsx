"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ClipboardList } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { EmptyState } from "@/components/empty-state";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/hooks/dateFormat";
import { formatNumber } from "@/lib/format";

import { stockAdjustmentService } from "../services/stockAdjustment.service";
import { useStockAdjustmentStore } from "../store/stockAdjustment.store";
import type { StockAdjustment } from "../types/stockAdjustment.type";

const quantityOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
};

type MovementKind = "in" | "out" | "none";

const movementStyles: Record<MovementKind, string> = {
    in: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    out: "bg-rose-50 text-rose-700 ring-rose-600/20",
    none: "bg-muted text-muted-foreground ring-border",
};

const movementLabels: Record<MovementKind, string> = {
    in: "Entrada",
    out: "Salida",
    none: "Sin movimiento",
};

function getMovement(quantity: number | string): MovementKind {
    const value = Number(quantity);

    if (value > 0) return "in";
    if (value < 0) return "out";
    return "none";
}

function MovementBadge({ quantity }: { quantity: number | string }) {
    const movement = getMovement(quantity);

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${movementStyles[movement]}`}
        >
            {movementLabels[movement]}
        </span>
    );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-card px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {value}
            </p>
        </div>
    );
}

interface DetailState {
    id: string;
    adjustment: StockAdjustment | null;
    error: boolean;
}

export default function StockAdjustmentDetailModal() {
    const { detailId, close } = useStockAdjustmentStore();
    const [detailState, setDetailState] = useState<DetailState | null>(null);

    useEffect(() => {
        if (!detailId) return;

        let active = true;

        const loadDetail = async () => {
            try {
                const response =
                    await stockAdjustmentService.getById(detailId);

                if (response.status !== 200) {
                    throw new Error("Respuesta inesperada al obtener el detalle");
                }

                if (active) {
                    setDetailState({
                        id: detailId,
                        adjustment: response.data,
                        error: false,
                    });
                }
            } catch (loadError) {
                console.error("Error cargando detalle de ajuste:", loadError);
                if (active) {
                    setDetailState({
                        id: detailId,
                        adjustment: null,
                        error: true,
                    });
                }
            }
        };

        void loadDetail();

        return () => {
            active = false;
        };
    }, [detailId]);

    const isCurrentDetail = detailState?.id === detailId;
    const loading = Boolean(detailId) && !isCurrentDetail;
    const error =
        Boolean(detailId) && isCurrentDetail && (detailState?.error ?? false);
    const adjustment =
        Boolean(detailId) && isCurrentDetail
            ? (detailState?.adjustment ?? null)
            : null;
    const items = adjustment?.stock_adjustment_items ?? [];

    return (
        <Dialog
            open={detailId !== null}
            onOpenChange={(value) => {
                if (!value) close();
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl lg:max-w-6xl">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        Detalle de ajuste de stock
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <EmptyState
                        icon={AlertCircle}
                        title="No se pudo cargar el detalle"
                        description="El ajuste puede no existir o no estar disponible."
                        action={
                            <Button variant="outline" onClick={close}>
                                Cerrar
                            </Button>
                        }
                    />
                ) : adjustment ? (
                    <div className="flex flex-col gap-4">
                        <SectionCard
                            icon={ClipboardList}
                            title="Información del ajuste"
                            description="Datos registrados al momento de la operación."
                        >
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                <SummaryItem
                                    label="Almacén"
                                    value={adjustment.warehouses?.name ?? "—"}
                                />
                                <SummaryItem
                                    label="Creado por"
                                    value={
                                        adjustment.users?.name ??
                                        adjustment.users?.email ??
                                        "—"
                                    }
                                />
                                <SummaryItem
                                    label="Fecha"
                                    value={formatDate(adjustment.created_at)}
                                />
                                <SummaryItem
                                    label="Motivo"
                                    value={adjustment.reason}
                                />
                                <SummaryItem
                                    label="Ítems"
                                    value={String(items.length)}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Productos ajustados"
                            description="El signo de la cantidad determina entradas, salidas o ausencia de movimiento."
                            bodyClassName="p-0"
                        >
                            {items.length === 0 ? (
                                <EmptyState
                                    compact
                                    icon={ClipboardList}
                                    title="Sin ítems registrados"
                                    className="m-4"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Unidad</TableHead>
                                                <TableHead className="text-right">
                                                    Factor
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Cantidad
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Base
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Costo unitario
                                                </TableHead>
                                                <TableHead>Movimiento</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item) => {
                                                const productName =
                                                    item.products?.name ??
                                                    "Producto";
                                                const model = item.products?.model;
                                                const unitName =
                                                    item.product_units?.name ??
                                                    "—";

                                                return (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <p className="font-medium">
                                                                {productName}
                                                            </p>
                                                            {model && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {model}
                                                                </p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {unitName}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatNumber(
                                                                item.product_units
                                                                    ?.conversion_factor,
                                                                {
                                                                    maximumFractionDigits: 4,
                                                                }
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatNumber(
                                                                item.quantity,
                                                                quantityOptions
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatNumber(
                                                                item.base_quantity,
                                                                quantityOptions
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {item.unit_cost == null
                                                                ? "—"
                                                                : formatNumber(
                                                                      item.unit_cost,
                                                                      quantityOptions
                                                                  )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <MovementBadge
                                                                quantity={
                                                                    item.quantity
                                                                }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
