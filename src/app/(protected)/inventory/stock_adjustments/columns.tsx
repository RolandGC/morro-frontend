"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/hooks/dateFormat";
import { useStockAdjustmentStore } from "@/modules/inventory/stockAdjustment/store/stockAdjustment.store";
import type { StockAdjustment } from "@/modules/inventory/stockAdjustment/types/stockAdjustment.type";

function ViewAdjustmentButton({ id }: { id: string }) {
    const { openDetail } = useStockAdjustmentStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => openDetail(id)}
            title="Ver detalle"
        >
            <Eye className="size-4" />
        </Button>
    );
}

export const getColumns = (): ColumnDef<StockAdjustment, unknown>[] => [
    {
        accessorFn: (row) => row.warehouses?.name ?? "—",
        id: "almacen",
        header: "Almacén",
    },
    {
        accessorFn: (row) => row.reason,
        id: "motivo",
        header: "Motivo",
    },
    {
        accessorFn: (row) => row.users?.name ?? row.users?.email ?? "—",
        id: "creador",
        header: "Creador",
    },
    {
        accessorFn: (row) => formatDate(row.created_at),
        id: "fecha",
        header: "Fecha",
    },
    {
        accessorFn: (row) => row.stock_adjustment_items?.length ?? 0,
        id: "items",
        header: "Ítems",
        cell: ({ getValue }) => String(getValue<number>()),
    },
    {
        id: "opciones",
        header: "Opciones",
        cell: ({ row }) => <ViewAdjustmentButton id={row.original.id} />,
    },
];
