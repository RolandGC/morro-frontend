"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, RotateCcw } from "lucide-react";

import InputText from "@/components/InputText";
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
import { usePermission } from "@/hooks/usePermission";
import { formatCurrency } from "@/lib/format";

import { CASH_SESSION_PERMISSIONS } from "../constants/cashSession.constants";
import { useCashSessionStore } from "../store/cashSession.store";
import type { Cashbox } from "../types/cashbox.types";
import {
    cashSessionCloseSchema,
    type CashSessionCloseForm,
} from "../validators/cashboxSchema";

const emptyForm: CashSessionCloseForm = {
    details: [],
    notes: "",
};

function toNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

export function CashSessionCloseModal() {
    const {
        closeModalOpen,
        session,
        sessionDetail,
        detailLoading,
        detailError,
        checking,
        submitting,
        error,
        checkSession,
        confirmClose,
        cancelClose,
        loadSessionDetail,
    } = useCashSessionStore();
    const { can } = usePermission();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CashSessionCloseForm>({
        resolver: zodResolver(cashSessionCloseSchema),
        defaultValues: emptyForm,
    });

    const watchedDetails = useWatch({ control, name: "details" }) ?? [];

    const source: Cashbox | null =
        sessionDetail && session && sessionDetail.id === session.id
            ? sessionDetail
            : session;
    const rows = (source?.cash_session_details ?? []).filter(
        (item) => item.payment_account_id
    );

    useEffect(() => {
        if (!closeModalOpen || !source) return;

        reset({
            details: (source.cash_session_details ?? [])
                .filter((item) => item.payment_account_id)
                .map((item) => ({
                    payment_account_id: item.payment_account_id as string,
                    declared_amount: 0,
                })),
            notes: "",
        });
    }, [closeModalOpen, source, reset]);

    const onSubmit = async (form: CashSessionCloseForm) => {
        await confirmClose(form);
    };

    const canClose = can(CASH_SESSION_PERMISSIONS.close);
    const sessionLabel = session?.id.slice(0, 8) ?? "";

    return (
        <Dialog
            open={closeModalOpen}
            onOpenChange={(value) => {
                if (!value) cancelClose();
            }}
        >
            <DialogContent
                showCloseButton={false}
                className="max-h-[90vh] overflow-y-auto sm:max-w-4xl"
            >
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        Cierre de caja
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Debes cerrar la sesión de caja antes de finalizar la sesión del
                    sistema. {sessionLabel ? `Sesión ${sessionLabel}.` : ""}
                </p>

                {detailLoading ? (
                    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                        <RotateCcw className="size-4 animate-spin" />
                        Cargando detalle de la sesión...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        {detailError && (
                            <div className="flex items-start justify-between gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                                <span>{detailError}</span>
                                {session?.id && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => void loadSessionDetail(session.id)}
                                    >
                                        Reintentar
                                    </Button>
                                )}
                            </div>
                        )}

                        {!canClose && (
                            <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                <span>
                                    No tienes permiso para cerrar sesiones de caja.
                                    No se puede completar el cierre de sesión.
                                </span>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/40">
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
                                        <TableHead className="w-44 text-right">
                                            Importe contado
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
                                                className="h-24 text-center"
                                            >
                                                Esta sesión no tiene cuentas
                                                registradas. Puedes cerrarla de todas
                                                formas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((item, index) => {
                                            const opening = toNumber(
                                                item.opening_amount
                                            );
                                            const collected = toNumber(
                                                item.collected_amount
                                            );
                                            const expected = toNumber(
                                                item.expected_amount
                                            );
                                            const declared = toNumber(
                                                watchedDetails[index]?.declared_amount
                                            );
                                            const difference =
                                                expected !== null && declared !== null
                                                    ? declared - expected
                                                    : null;

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        <input
                                                            type="hidden"
                                                            {...register(
                                                                `details.${index}.payment_account_id`
                                                            )}
                                                        />
                                                        {item.payment_accounts?.name ??
                                                            "Cuenta de pago"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(opening ?? 0)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {collected === null
                                                            ? "—"
                                                            : formatCurrency(collected)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {expected === null
                                                            ? "—"
                                                            : formatCurrency(expected)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <InputText
                                                            name={`details.${index}.declared_amount`}
                                                            type="number"
                                                            step="0.01"
                                                            register={register}
                                                            registerOptions={{
                                                                setValueAs: (
                                                                    value: string
                                                                ) => {
                                                                    if (
                                                                        String(value).trim() ===
                                                                        ""
                                                                    )
                                                                        return 0;
                                                                    return Number(value);
                                                                },
                                                            }}
                                                            error={
                                                                errors.details?.[index]
                                                                    ?.declared_amount
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right font-medium ${
                                                            difference !== null && difference < 0
                                                                ? "text-red-600"
                                                                : difference !== null && difference > 0
                                                                  ? "text-emerald-600"
                                                                  : ""
                                                        }`}
                                                    >
                                                        {difference === null
                                                            ? "—"
                                                            : formatCurrency(difference)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <InputText
                            name="notes"
                            label="Observaciones de cierre"
                            placeholder="Ej. Cierre sin novedades"
                            register={register}
                            error={errors.notes}
                        />

                        {error && (
                            <div className="flex items-start justify-between gap-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                    <span>{error}</span>
                                </div>

                                {!session && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void checkSession("logout")}
                                        disabled={checking}
                                    >
                                        {checking
                                            ? "Verificando..."
                                            : "Reintentar verificación"}
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelClose}
                                disabled={submitting}
                            >
                                Cancelar y continuar operando
                            </Button>

                            <Button
                                type="submit"
                                disabled={submitting || !canClose || !session}
                            >
                                {submitting
                                    ? "Cerrando caja..."
                                    : "Confirmar cierre y salir"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
