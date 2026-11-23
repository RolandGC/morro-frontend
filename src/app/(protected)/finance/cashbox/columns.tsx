"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { Cashbox } from "@/modules/finances/cashbox/types/cashbox.types";
import {
    formatCashSessionDateTime,
    getCashSessionAccountSummary,
} from "@/modules/finances/cashbox/utils/cashSessionMovements";
import { cash_session_status } from "@/types/types";

interface ColumnsProps {
    onView: (session: Cashbox) => void;
    onClose: (session: Cashbox) => void;
    canClose: boolean;
}

export const getColumns = ({
    onView,
    onClose,
    canClose,
}: ColumnsProps): ColumnDef<Cashbox>[] => [
    {
        accessorFn: (row) => row.id.slice(0, 8),
        id: "Sesión",
        header: "Sesión",
    },
    {
        accessorFn: (row) => row.users?.name ?? "—",
        id: "Usuario",
        header: "Usuario",
    },
    {
        accessorFn: (row) => row.warehouses?.name ?? "—",
        id: "Almacén",
        header: "Almacén",
    },
    {
        accessorFn: (row) => row.companies?.name ?? "—",
        id: "Empresa",
        header: "Empresa",
    },
    {
        accessorFn: (row) => formatCashSessionDateTime(row.opened_at),
        id: "Apertura",
        header: "Apertura",
    },
    {
        accessorFn: (row) => formatCashSessionDateTime(row.closed_at),
        id: "Cierre",
        header: "Cierre",
    },
    {
        accessorFn: (row) => row.status,
        id: "Estado",
        header: "Estado",
        cell: ({ row }) => {
            const isOpen = row.original.status === cash_session_status.open;
            return (
                <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        isOpen
                            ? "bg-emerald-500/15 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                    }`}
                >
                    {isOpen ? "Abierta" : "Cerrada"}
                </span>
            );
        },
    },
    {
        id: "Esperado",
        header: "Saldo esperado",
        cell: ({ row }) => {
            const total = getCashSessionAccountSummary(row.original).reduce(
                (sum, item) => sum + item.expected_amount,
                0
            );
            return <span className="money">{formatCurrency(total)}</span>;
        },
    },
    {
        id: "Declarado",
        header: "Declarado",
        cell: ({ row }) => {
            const rows = getCashSessionAccountSummary(row.original);
            const hasDeclared = rows.some((item) => item.declared_amount !== null);
            if (!hasDeclared) return <span className="text-muted-foreground">—</span>;
            const total = rows.reduce(
                (sum, item) => sum + (item.declared_amount ?? 0),
                0
            );
            return <span className="money">{formatCurrency(total)}</span>;
        },
    },
    {
        id: "Diferencia",
        header: "Diferencia",
        cell: ({ row }) => {
            const rows = getCashSessionAccountSummary(row.original);
            const hasDeclared = rows.some((item) => item.declared_amount !== null);
            if (!hasDeclared) return <span className="text-muted-foreground">—</span>;

            const total = rows.reduce(
                (sum, item) =>
                    sum +
                    ((item.declared_amount ?? 0) - item.expected_amount),
                0
            );

            return (
                <span
                    className={`money font-semibold ${
                        total < 0
                            ? "text-red-600"
                            : total > 0
                              ? "text-emerald-600"
                              : ""
                    }`}
                >
                    {formatCurrency(total)}
                </span>
            );
        },
    },
    {
        id: "Acciones",
        header: "Acciones",
        cell: ({ row }) => {
            const session = row.original;
            const isOpen = session.status === cash_session_status.open;

            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Ver detalle"
                        onClick={() => onView(session)}
                    >
                        <Eye className="size-4" />
                    </Button>
                    {isOpen && canClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Cerrar caja"
                            onClick={() => onClose(session)}
                        >
                            <LockKeyhole className="size-4" />
                        </Button>
                    )}
                </div>
            );
        },
    },
];
