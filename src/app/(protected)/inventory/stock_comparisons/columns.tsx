"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/hooks/dateFormat";
import { formatNumber } from "@/lib/format";
import { useStockComparisonStore } from "@/modules/inventory/stockComparisons/store/stockComparison.store";
import type { StockComparison } from "@/modules/inventory/stockComparisons/types/stockComparisons.type";

const quantityOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
};

function ViewComparisonButton({ id }: { id: string }) {
    const { openDetail } = useStockComparisonStore();

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

export const getColumns = (): ColumnDef<StockComparison, unknown>[] => [
    {
        accessorFn: (row) => row.warehouses?.name ?? "—",
        id: "almacen",
        header: "Almacén",
    },
    {
        accessorFn: (row) => row.reason ?? "—",
        id: "motivo",
        header: "Motivo",
    },
    {
        accessorFn: (row) =>
            row.users?.name ?? row.users?.email ?? "—",
        id: "creador",
        header: "Creador",
    },
    {
        accessorFn: (row) => formatDate(row.created_at),
        id: "fecha",
        header: "Fecha",
    },
    {
        accessorFn: (row) => row.items_count,
        id: "items",
        header: "Ítems",
        cell: ({ getValue }) => String(getValue<number>()),
    },
    {
        accessorFn: (row) => row.differences_count,
        id: "diferencias",
        header: "Diferencias",
        cell: ({ getValue }) => String(getValue<number>()),
    },
    {
        accessorFn: (row) => Number(row.surplus_quantity ?? 0),
        id: "sobrante",
        header: "Sobrante",
        cell: ({ getValue }) =>
            formatNumber(getValue<number>(), quantityOptions),
    },
    {
        accessorFn: (row) => Number(row.shortage_quantity ?? 0),
        id: "faltante",
        header: "Faltante",
        cell: ({ getValue }) =>
            formatNumber(getValue<number>(), quantityOptions),
    },
    {
        id: "opciones",
        header: "Opciones",
        cell: ({ row }) => <ViewComparisonButton id={row.original.id} />,
    },
];
