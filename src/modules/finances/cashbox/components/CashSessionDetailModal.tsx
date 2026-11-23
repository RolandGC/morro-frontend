"use client";

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
import { formatCurrency } from "@/lib/format";

import type { Cashbox } from "../types/cashbox.types";
import {
    formatCashSessionDateTime,
    getCashSessionAccountSummary,
    getCashSessionMovements,
} from "../utils/cashSessionMovements";

interface CashSessionDetailModalProps {
    session: Cashbox | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formatDateTime = formatCashSessionDateTime;

export function CashSessionDetailModal({
    session,
    open,
    onOpenChange,
}: CashSessionDetailModalProps) {
    const rows = getCashSessionAccountSummary(session);
    const movements = getCashSessionMovements(session);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-bold text-xl">
                        Detalle de sesión de caja
                    </DialogTitle>
                </DialogHeader>

                {!session ? (
                    <p className="text-sm text-muted-foreground">
                        No hay información para mostrar.
                    </p>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-muted-foreground">Usuario</p>
                                <p className="font-medium">
                                    {session.users?.name ?? "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Almacén</p>
                                <p className="font-medium">
                                    {session.warehouses?.name ?? "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Apertura</p>
                                <p className="font-medium">
                                    {formatDateTime(session.opened_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Cierre</p>
                                <p className="font-medium">
                                    {formatDateTime(session.closed_at)}
                                </p>
                            </div>
                        </div>

                        <section className="overflow-hidden rounded-md border">
                            <h3 className="border-b bg-muted/40 px-3 py-2 text-sm font-semibold">
                                Conciliación por cuenta
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cuenta</TableHead>
                                        <TableHead className="text-right">
                                            Apertura
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Movimientos
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Esperado
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Declarado
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Diferencia
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-20 text-center text-muted-foreground"
                                            >
                                                Sin cuentas registradas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((row) => (
                                            <TableRow key={row.payment_account_id}>
                                                <TableCell className="font-medium">
                                                    {row.payment_account_name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(row.opening_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(row.collected_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(row.expected_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {row.declared_amount === null
                                                        ? "—"
                                                        : formatCurrency(
                                                              row.declared_amount
                                                          )}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-medium ${
                                                        row.difference !== null &&
                                                        row.difference < 0
                                                            ? "text-red-600"
                                                            : row.difference !== null &&
                                                                row.difference > 0
                                                              ? "text-emerald-600"
                                                              : ""
                                                    }`}
                                                >
                                                    {row.difference === null
                                                        ? "—"
                                                        : formatCurrency(row.difference)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </section>

                        <section className="overflow-hidden rounded-md border">
                            <h3 className="border-b bg-muted/40 px-3 py-2 text-sm font-semibold">
                                Movimientos ({movements.length})
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Cuenta</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right">
                                            Importe
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-20 text-center text-muted-foreground"
                                            >
                                                No hay movimientos vinculados a esta
                                                sesión.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        movements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell>
                                                    {formatDateTime(
                                                        movement.payment_date
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {movement.type === "sale_payment"
                                                        ? "Venta"
                                                        : "Cobro"}
                                                </TableCell>
                                                <TableCell>
                                                    {movement.payment_account_name}
                                                </TableCell>
                                                <TableCell>
                                                    {movement.description}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(movement.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </section>

                        {session.notes && (
                            <p className="rounded-md border bg-muted/20 p-3 text-sm">
                                <span className="font-semibold">Observaciones: </span>
                                {session.notes}
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
