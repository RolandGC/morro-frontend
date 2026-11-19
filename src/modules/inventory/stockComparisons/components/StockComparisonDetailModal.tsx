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

import { stockComparisonsService } from "../services/stockComparisons.service";
import { useStockComparisonStore } from "../store/stockComparison.store";
import type {
    StockComparison,
    StockComparisonStatus,
} from "../types/stockComparisons.type";

const quantityOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
};

const statusStyles: Record<StockComparisonStatus, string> = {
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    surplus: "bg-sky-50 text-sky-700 ring-sky-600/20",
    shortage: "bg-amber-50 text-amber-700 ring-amber-600/20",
    not_tracked: "bg-muted text-muted-foreground ring-border",
};

const statusLabels: Record<StockComparisonStatus, string> = {
    ok: "Correcto",
    surplus: "Sobrante",
    shortage: "Faltante",
    not_tracked: "Sin control de stock",
};

function StatusBadge({ status }: { status: StockComparisonStatus }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status] ?? statusStyles.not_tracked}`}
        >
            {statusLabels[status] ?? status}
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
    comparison: StockComparison | null;
    error: boolean;
}

export default function StockComparisonDetailModal() {
    const { detailId, close } = useStockComparisonStore();
    const [detailState, setDetailState] = useState<DetailState | null>(null);

    useEffect(() => {
        if (!detailId) return;

        let active = true;

        const loadDetail = async () => {
            try {
                const response =
                    await stockComparisonsService.getById(detailId);

                if (response.status !== 200) {
                    throw new Error("Respuesta inesperada al obtener el detalle");
                }

                if (active) {
                    setDetailState({
                        id: detailId,
                        comparison: response.data,
                        error: false,
                    });
                }
            } catch (loadError) {
                console.error("Error cargando detalle de comparación:", loadError);
                if (active) {
                    setDetailState({
                        id: detailId,
                        comparison: null,
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
    const comparison =
        Boolean(detailId) && isCurrentDetail
            ? (detailState?.comparison ?? null)
            : null;
    const items = comparison?.stock_comparison_items ?? [];

    return (
        <Dialog
            open={detailId !== null}
            onOpenChange={(value) => {
                if (!value) close();
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        Detalle de comparación de stock
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <EmptyState
                        icon={AlertCircle}
                        title="No se pudo cargar el detalle"
                        description="La comparación puede no existir o no estar disponible."
                        action={
                            <Button variant="outline" onClick={close}>
                                Cerrar
                            </Button>
                        }
                    />
                ) : comparison ? (
                    <div className="flex flex-col gap-4">
                        <SectionCard
                            icon={ClipboardList}
                            title="Información de la comparación"
                            description="Datos registrados al momento de la auditoría."
                        >
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <SummaryItem
                                    label="Almacén"
                                    value={
                                        comparison.warehouses?.name ?? "—"
                                    }
                                />
                                <SummaryItem
                                    label="Creado por"
                                    value={
                                        comparison.users?.name ??
                                        comparison.users?.email ??
                                        "—"
                                    }
                                />
                                <SummaryItem
                                    label="Fecha"
                                    value={formatDate(comparison.created_at)}
                                />
                                <SummaryItem
                                    label="Motivo"
                                    value={comparison.reason ?? "—"}
                                />
                                <SummaryItem
                                    label="Ítems"
                                    value={String(comparison.items_count)}
                                />
                                <SummaryItem
                                    label="Diferencias"
                                    value={String(comparison.differences_count)}
                                />
                                <SummaryItem
                                    label="Sobrante"
                                    value={formatNumber(
                                        comparison.surplus_quantity,
                                        quantityOptions
                                    )}
                                />
                                <SummaryItem
                                    label="Faltante"
                                    value={formatNumber(
                                        comparison.shortage_quantity,
                                        quantityOptions
                                    )}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Productos contabilizados"
                            description="Snapshot de existencias del sistema frente al conteo físico."
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
                                                    Sistema
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Contada
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Base
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Diferencia
                                                </TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item) => {
                                                const productName =
                                                    item.products?.name ??
                                                    item.product_name ??
                                                    "Producto";
                                                const model =
                                                    item.products?.model ??
                                                    item.product_model;
                                                const unitName =
                                                    item.product_units?.name ??
                                                    item.unit_name ??
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
                                                            {unitName}{" "}
                                                            <span className="text-xs text-muted-foreground">
                                                                x
                                                                {formatNumber(
                                                                    item.conversion_factor,
                                                                    {
                                                                        maximumFractionDigits: 4,
                                                                    }
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatNumber(
                                                                item.system_quantity,
                                                                quantityOptions
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatNumber(
                                                                item.counted_quantity,
                                                                quantityOptions
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatNumber(
                                                                item.counted_base_quantity,
                                                                quantityOptions
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatNumber(
                                                                item.difference_base,
                                                                quantityOptions
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                status={item.status}
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
