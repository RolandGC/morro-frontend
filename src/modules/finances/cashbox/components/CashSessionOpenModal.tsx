"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, RotateCcw } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import InputText from "@/components/InputText";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { CASH_SESSION_DEFAULT_OPEN_NOTES } from "../constants/cashSession.constants";
import { useCashSessionStore } from "../store/cashSession.store";
import { cashboxSchema, type CashboxForm } from "../validators/cashboxSchema";

const emptyForm: CashboxForm = {
    warehouse_id: "",
    company_id: "",
    notes: CASH_SESSION_DEFAULT_OPEN_NOTES,
    details: [],
};

export function CashSessionOpenModal() {
    const {
        openModalOpen,
        accounts,
        accountsLoading,
        submitting,
        error,
        context,
        confirmOpen,
        dismissOpen,
        loadAccounts,
    } = useCashSessionStore();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CashboxForm>({
        resolver: zodResolver(cashboxSchema),
        defaultValues: emptyForm,
    });

    useEffect(() => {
        if (!openModalOpen) return;

        reset({
            warehouse_id: context?.warehouseId ?? "",
            company_id: context?.companyId ?? "",
            notes: CASH_SESSION_DEFAULT_OPEN_NOTES,
            details: accounts.map((account) => ({
                payment_account_id: account.id,
                opening_amount: 0,
            })),
        });
    }, [openModalOpen, accounts, context, reset]);

    const onSubmit = async (form: CashboxForm) => {
        await confirmOpen(form);
    };

    return (
        <Dialog
            open={openModalOpen}
            onOpenChange={(value) => {
                if (!value) dismissOpen();
            }}
        >
            <DialogContent
                aria-describedby={undefined}
                showCloseButton={false}
                className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
            >
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        Apertura de caja
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Registra el fondo inicial de cada cuenta de efectivo para abrir
                    la sesión en la empresa y almacén actuales.
                </p>

                {accountsLoading ? (
                    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                        <RotateCcw className="size-4 animate-spin" />
                        Cargando cuentas de efectivo...
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="flex flex-col gap-4">
                        <EmptyState
                            icon={AlertCircle}
                            title={
                                error
                                    ? "No se pudo preparar la apertura"
                                    : "No hay cuentas de efectivo activas"
                            }
                            description={
                                error ??
                                "No es posible registrar la apertura sin cuentas de pago de tipo efectivo."
                            }
                        />

                        <div className="flex items-center justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={dismissOpen}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={() => void loadAccounts()}
                                disabled={accountsLoading}
                            >
                                Reintentar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4"
                    >
                        <input type="hidden" {...register("warehouse_id")} />
                        <input type="hidden" {...register("company_id")} />

                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold">
                                Fondo inicial por cuenta
                            </p>

                            {accounts.map((account, index) => (
                                <div
                                    key={account.id}
                                    className="grid grid-cols-1 items-start gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
                                >
                                    <div className="flex flex-col justify-center">
                                        <input
                                            type="hidden"
                                            {...register(
                                                `details.${index}.payment_account_id`
                                            )}
                                        />
                                        <p className="text-sm font-medium">
                                            {account.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {account.account_number
                                                ? `N.º ${account.account_number} · `
                                                : ""}
                                            Efectivo
                                        </p>
                                    </div>

                                    <InputText
                                        name={`details.${index}.opening_amount`}
                                        label="Importe inicial"
                                        type="number"
                                        step="0.01"
                                        register={register}
                                        registerOptions={{
                                            setValueAs: (value: string) => {
                                                if (String(value).trim() === "") return 0;
                                                return Number(value);
                                            },
                                        }}
                                        error={
                                            errors.details?.[index]?.opening_amount
                                        }
                                    />
                                </div>
                            ))}

                            {errors.details?.root?.message && (
                                <p className="text-[13px] text-red-500">
                                    {errors.details.root.message}
                                </p>
                            )}
                        </div>

                        <InputText
                            name="notes"
                            label="Observaciones"
                            placeholder={CASH_SESSION_DEFAULT_OPEN_NOTES}
                            register={register}
                            error={errors.notes}
                        />

                        {error && (
                            <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={dismissOpen}
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>

                            {accounts.length === 0 ? (
                                <Button
                                    type="button"
                                    onClick={() => void loadAccounts()}
                                    disabled={accountsLoading}
                                >
                                    Reintentar
                                </Button>
                            ) : (
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Abriendo caja..." : "Confirmar apertura"}
                                </Button>
                            )}
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
