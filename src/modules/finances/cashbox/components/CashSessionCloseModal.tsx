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
import { getCashSessionAccountSummary } from "../utils/cashSessionMovements";
import {
    cashSessionCloseSchema,
    type CashSessionCloseForm,
} from "../validators/cashboxSchema";

const emptyForm: CashSessionCloseForm = {
    details: [],
    notes: "",
};

export function CashSessionCloseModal() {
    const {
        closeModalOpen,
        closePurpose,
        session,
        sessionDetail,
        accounts,
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

    const source =
        sessionDetail && session && sessionDetail.id === session.id
            ? sessionDetail
            : session;
    const rows = getCashSessionAccountSummary(source, accounts);

    useEffect(() => {
        if (!closeModalOpen || !source) return;

        reset({
            details: rows.map((row) => ({
                payment_account_id: row.payment_account_id,
                declared_amount: row.declared_amount ?? 0,
            })),
            notes: "",
        });
        // `rows` se recalcula en cada render; reiniciar sólo cuando cambia el
        // detalle cargado evita sobrescribir lo que el usuario está digitando.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closeModalOpen, source, reset]);

    const onSubmit = async (form: CashSessionCloseForm) => {
        await confirmClose(form);
    };

    const canClose = can(CASH_SESSION_PERMISSIONS.close);
    const sessionLabel = session?.id.slice(0, 8) ?? "";
    const isLogoutClose = closePurpose === "logout";

    return (
        <Dialog
            open={closeModalOpen}
            onOpenChange={(value) => {
                if (!value) cancelClose();
            }}
        >
            <DialogContent
                aria-describedby={undefined}
                showCloseButton={false}
                className="max-h-[90vh] overflow-y-auto sm:max-w-4xl"
            >
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        Cierre de caja
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    {isLogoutClose
                        ? "Debes cerrar la sesión de caja antes de finalizar la sesión del sistema."
                        : "Declara el importe real de cada cuenta para conciliar la sesión actual."}{" "}
                    {sessionLabel ? `Sesión ${sessionLabel}.` : ""}
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
                                </span>
                            </div>
                        )}

                        {rows.length === 0 && (
                            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
                                No hay cuentas de pago disponibles para declarar el
                                cierre.
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
                                    {rows.map((row, index) => {
                                        const declared = Number(
                                            watchedDetails[index]?.declared_amount ?? 0
                                        );
                                        const difference =
                                            declared - row.expected_amount;

                                        return (
                                            <TableRow key={row.payment_account_id}>
                                                <TableCell className="font-medium">
                                                    <input
                                                        type="hidden"
                                                        {...register(
                                                            `details.${index}.payment_account_id`
                                                        )}
                                                    />
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
                                                                    String(value).trim() === ""
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
                                                        difference < 0
                                                            ? "text-red-600"
                                                            : difference > 0
                                                              ? "text-emerald-600"
                                                              : ""
                                                    }`}
                                                >
                                                    {formatCurrency(difference)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            {errors.details?.root?.message && (
                                <p className="px-3 pb-2 text-[13px] text-red-500">
                                    {errors.details.root.message}
                                </p>
                            )}
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
                                        onClick={() =>
                                            void checkSession(
                                                isLogoutClose ? "logout" : "close-request"
                                            )
                                        }
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
                                {isLogoutClose
                                    ? "Cancelar y continuar operando"
                                    : "Cancelar"}
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !canClose ||
                                    !session ||
                                    rows.length === 0
                                }
                            >
                                {submitting
                                    ? "Cerrando caja..."
                                    : isLogoutClose
                                      ? "Confirmar cierre y salir"
                                      : "Confirmar cierre"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
