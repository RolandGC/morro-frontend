"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { useSaleStore } from "@/modules/sales/sale/store/sale.store";
import { saleService } from "@/modules/sales/sale/services/sale.service";
import { showToast } from "@/hooks/useToast";
import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { sale_type } from "@/types/types";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";
import { SaleDetail } from "@/modules/sales/sale/types/sale.types";
import { Company } from "@/modules/core/companies/types/company.type";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { accountService } from "@/modules/finances/Account/services/account.service";
import { Account } from "@/modules/finances/Account/types/account.types";
import TicketFormModal from "@/modules/sales/sale/components/TicketFormModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CardPayment from "@/modules/sales/sale/components/CardPayment";
import { useCustomerDisplayPublisher } from "@/modules/sales/sale/hooks/useCustomerDisplayPublisher";
import { CheckCircle2, CreditCard, Plus, ReceiptText, ArrowLeft } from "lucide-react";

type CreatedSale = SaleDetail & { notaPedidoBase64: string };

export default function PagoStep() {
    const router = useRouter();

    const {
        handleSubmit,
        control,
        register,
        watch,
        setValue,
        formState: { isSubmitting }
    } = useFormContext<SaleForm>();

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [data, setData] = useState<Account[]>([]);
    const items = watch("items") ?? [];
    const payments = watch("payments") ?? [];

    const { markThanks } = useCustomerDisplayPublisher();

    const saleTypes = [
        { id: sale_type.cash, name: "Al contado" },
        { id: sale_type.credit, name: "Crédito" },
    ];

    const { fields, append, remove } = useFieldArray({
        control,
        name: "payments",
    });

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await currencyService.getAll({
                    is_active: true,
                });

                if (response.status === 200) {
                    const currenciesData: Currency[] = response.data.data;

                    setCurrencies(currenciesData);

                    const currentCurrencyId = watch("currency_id");

                    if (!currentCurrencyId) {
                        const pen = currenciesData.find(
                            (currency) => currency.code?.toUpperCase() === "PEN"
                        );

                        if (pen) {
                            setValue("currency_id", pen.id, {
                                shouldValidate: true,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error cargando monedas:", error);
            }
        };

        fetchCurrencies();
    }, [setValue, watch]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await accountService.getAll({
                    is_active: true,
                });

                if (response.status === 200) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Error cargando cuentas:", error);
            }
        };

        fetchAccounts();
    }, []);

    const onSubmit = async (data: SaleForm) => {
        const storedCompany = localStorage.getItem("selected_company");

        if (!storedCompany) {
            showToast("No existe empresa seleccionada", "error");
            return;
        }

        const parsedCompany: Company = JSON.parse(storedCompany);

        try {
            const response = await saleService.create({
                ...data,
                company_id: parsedCompany.id,
                warehouse_id: parsedCompany.warehouse?.id,
            });

            if (response.status === 201 || response.status === 200) {
                const notaPedidoBase64 = response.data.notaPedidoBase64;

                // store created sale and open success dialog
                setCreatedSale(response.data as unknown as CreatedSale);
                setSuccessDialogOpen(true);

                // Muestra el agradecimiento en la pantalla del cliente.
                markThanks();

                if (notaPedidoBase64) {
                    // keep behavior to allow immediate print
                    openPdf(notaPedidoBase64);
                }
            }
        } catch (error) {
            console.error("Error al guardar la venta:", error);
            showToast("Error al guardar la venta", "error");
        }
    };

    const openPdf = (base64: string) => {
        try {
            const cleanBase64 = base64.includes(",")
                ? base64.split(",")[1]
                : base64;

            const byteCharacters = atob(cleanBase64);
            const byteArrays = [];

            for (
                let offset = 0;
                offset < byteCharacters.length;
                offset += 1024
            ) {
                const slice = byteCharacters.slice(
                    offset,
                    offset + 1024
                );

                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                byteArrays.push(new Uint8Array(byteNumbers));
            }

            const blob = new Blob(byteArrays, {
                type: "application/pdf",
            });

            const pdfUrl = URL.createObjectURL(blob);

            window.open(pdfUrl, "_blank");
        } catch (error) {
            console.error("Error abriendo comprobante:", error);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo abrir el comprobante.",
            });
        }
    };

    const addPayment = () => {
        const pen = currencies.find(
            (currency) => currency.code?.toUpperCase() === "PEN"
        );

        append({
            payment_account_id: "",
            currency_id: pen?.id ?? "",
            amount: undefined,
            exchange_rate: 1,
            notes: "",
        });
    };

    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [ticketOpen, setTicketOpen] = useState(false);
    const [createdSale, setCreatedSale] = useState<CreatedSale | null>(null);

    const totalToPay = items.reduce((total, item) => {
        const quantity = Number(item.quantity ?? 0);
        const unitPrice = Number(item.unit_price ?? 0);

        return total + quantity * unitPrice;
    }, 0);

    const totalPaid = payments.reduce((total, payment) => {
        return total + Number(payment.amount ?? 0);
    }, 0);
    const pendingAmount = Math.max(0, totalToPay - totalPaid);
    const paymentDifference = totalPaid - totalToPay;

    const handleCloseSuccessDialog = () => {
        useSaleStore.getState().startNew();

        setSuccessDialogOpen(false);

        router.push("/sales/sale");
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <PageHeader
                icon={ReceiptText}
                title="Registrar pago"
                description="Configura la venta y registra los medios de pago."
                backHref="/sales/sale/add"
                backLabel="Volver a productos"
                actions={
                    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
                        <span className="text-xs text-muted-foreground">
                            Total a cobrar
                        </span>
                        <span className="money text-sm font-semibold">
                            {formatCurrency(totalToPay)}
                        </span>
                    </div>
                }
            />

            {/* =========================================================
            INFORMACIÓN GENERAL
        ========================================================== */}
            <section className="mb-6 rounded-2xl border bg-card">
                <div className="rounded-t-2xl border-b px-5 py-3">
                    <h3 className="text-sm font-semibold">
                        Información de la venta
                    </h3>

                    <p className="text-xs text-muted-foreground">
                        Define las condiciones generales de la operación.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                    <Controller
                        name="sale_type"
                        control={control}
                        render={({ field, fieldState }) => (
                            <SimpleSelector
                                label="Tipo de venta"
                                value={field.value}
                                options={saleTypes}
                                onSelect={field.onChange}
                                error={fieldState.error}
                            />
                        )}
                    />

                    <Controller
                        name="currency_id"
                        control={control}
                        render={({ field, fieldState }) => (
                            <SimpleSelector
                                label="Moneda"
                                value={field.value}
                                options={currencies.map((currency) => ({
                                    id: currency.id,
                                    name: currency.name,
                                }))}
                                onSelect={field.onChange}
                                error={fieldState.error}
                            />
                        )}
                    />

                    <InputText
                        name="exchange_rate"
                        label="Tipo de cambio"
                        type="number"
                        register={register}
                        registerOptions={{
                            valueAsNumber: true,
                        }}
                    />
                </div>
            </section>

            
            {/* =========================================================
            CONTENIDO PRINCIPAL
        ========================================================== */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                {/* =====================================================
                DETALLE DE VENTA
            ====================================================== */}
                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="rounded-t-2xl border-b px-5 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Detalle de venta
                                </h3>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Productos incluidos en esta operación.
                                </p>
                            </div>

                            <span className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                {items.length}{" "}
                                {items.length === 1 ? "prod" : "prods"}
                            </span>
                        </div>
                    </div>

                    <div className="p-5">
                        {items.length === 0 ? (
                            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed bg-muted/20">
                                <p className="text-sm text-muted-foreground">
                                    No hay productos agregados.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {items.map((item, index) => {
                                    const quantity = Number(
                                        item.quantity ?? 0
                                    );

                                    const unitPrice = Number(
                                        item.unit_price ?? 0
                                    );

                                    const subtotal =
                                        quantity * unitPrice;

                                    return (
                                        <div
                                            key={index}
                                            className="group flex items-center justify-between gap-4 rounded-xl border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                                                    {index + 1}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        Producto #{index + 1}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {quantity} × S/{" "}
                                                        {unitPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="shrink-0 text-sm font-semibold">
                                                S/ {subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* TOTAL */}
                        <div className="mt-5 flex items-center justify-between border-t pt-4">
                            <span className="text-sm font-medium text-muted-foreground">
                                Total
                            </span>

                            <span className="text-xl font-bold">
                                S/ {totalToPay.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ==== PAGOS======= */}
                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="rounded-t-2xl border-b px-5 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Medios de pago
                                </h3>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Registra uno o más pagos para completar la venta.
                                </p>
                            </div>

                            <Button
                                type="button"
                                onClick={addPayment}
                                className="w-full sm:w-auto"
                            >
                                <Plus className="size-4" />
                                Agregar pago
                            </Button>
                        </div>
                    </div>

                    <div className="p-5">
                        {fields.length === 0 ? (
                            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <CreditCard className="size-5" />
                                </div>

                                <p className="font-medium">
                                    No hay pagos registrados
                                </p>

                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Agrega un medio de pago para registrar cómo se
                                    cancelará esta venta.
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addPayment}
                                    className="mt-4"
                                >
                                    <Plus className="size-4" />
                                    Agregar primer pago
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <CardPayment
                                            key={field.id}
                                            index={index}
                                            control={control}
                                            register={register}
                                            currencies={currencies}
                                            accounts={data}
                                            onRemove={remove}
                                        />
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addPayment}
                                    className="mt-4 w-full border-dashed"
                                >
                                    <Plus className="size-4" />
                                    Agregar otro pago
                                </Button>
                            </>
                        )}
                    </div>
                </section>
            </div>

            {/* =========================================================
            RESUMEN FINAL
        ========================================================== */}
            <section className="mt-6 rounded-2xl border bg-card shadow-sm lg:sticky lg:bottom-4">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold">
                            Resumen de pago
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Verifica que el monto registrado coincida con el total
                            antes de guardar.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Total
                            </p>

                            <p className="money font-semibold">
                                {formatCurrency(totalToPay)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Pagado
                            </p>

                            <p className="money font-semibold text-success">
                                {formatCurrency(totalPaid)}
                            </p>
                        </div>

                        <div
                            className={`rounded-xl px-4 py-2 ${pendingAmount > 0
                                    ? "bg-warning/15 text-warning-foreground dark:text-warning"
                                    : paymentDifference > 0
                                        ? "bg-info/10 text-info"
                                        : "bg-success/10 text-success"
                                }`}
                        >
                            <p className="text-xs font-medium">
                                {pendingAmount > 0
                                    ? "Pendiente"
                                    : paymentDifference > 0
                                        ? "Excedente"
                                        : "Estado"}
                            </p>

                            <p className="money font-bold">
                                {pendingAmount > 0
                                    ? formatCurrency(pendingAmount)
                                    : paymentDifference > 0
                                        ? formatCurrency(paymentDifference)
                                        : "COMPLETO"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
            NAVEGACIÓN
        ========================================================== */}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/sales/sale/add")}
                    className="w-full sm:w-auto"
                >
                    <ArrowLeft className="size-4" />
                    Anterior
                </Button>

                <Button
                    type="button"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={handleSubmit(
                        onSubmit,
                        (errors) => {
                            console.log(
                                "❌ ERRORES DE VALIDACIÓN:",
                                errors
                            );
                        }
                    )}
                    className="w-full min-w-44 sm:w-auto"
                >
                    {isSubmitting ? "Guardando..." : "Guardar venta"}
                </Button>
            </div>

            {/* =========================================================
            MODAL TICKET
        ========================================================== */}
            <TicketFormModal
                open={ticketOpen}
                onOpenChange={(next) => {
                    if (!next) {
                        close();
                    }
                }}
                sale={createdSale}
                onSuccess={() => {
                    setSuccessDialogOpen(false);
                }}
                onClosed={() => {
                    useSaleStore.getState().startNew();
                    router.push("/sales/sale");
                }}
            />
            {/* =========================================================
            MODAL ÉXITO
        ========================================================== */}
            <Dialog
                open={successDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseSuccessDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Venta creada correctamente
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                                    <CheckCircle2 className="size-5" />
                                </div>

                                <div>
                                    <p className="font-medium">
                                        Operación completada
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        La venta se registró correctamente.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            {createdSale?.notaPedidoBase64 && (
                                <Button
                                    onClick={() =>
                                        openPdf(
                                            createdSale.notaPedidoBase64
                                        )
                                    }
                                    className="w-full"
                                >
                                    Imprimir comprobante
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTicketOpen(true);
                                    setSuccessDialogOpen(false);
                                }}
                                className="w-full"
                            >
                                Emitir boleta
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleCloseSuccessDialog}
                                className="w-full"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );

}
