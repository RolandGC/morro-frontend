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
import { Company } from "@/modules/core/companies/types/company.type";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { accountService } from "@/modules/finances/Account/services/account.service";
import { Account } from "@/modules/finances/Account/types/account.types";
import TicketFormModal from "@/modules/sales/sale/components/TicketFormModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PagoStep() {
    const router = useRouter();

    const {
        handleSubmit,
        control,
        register,
    } = useFormContext<SaleForm>();

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [data, setData] = useState<Account[]>([]);

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
                    setCurrencies(response.data.data);
                }
            } catch (error) {
                console.error("Error cargando monedas:", error);
            }
        };

        fetchCurrencies();
    }, []);

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
        const { isEditing } = useSaleStore.getState();

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
                setCreatedSale(response.data);
                setSuccessDialogOpen(true);

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
        append({
            payment_account_id: "",
            currency_id: "",
            amount: 0,
            exchange_rate: 1,
            notes: "",
        });
    };

    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [ticketOpen, setTicketOpen] = useState(false);
    const [createdSale, setCreatedSale] = useState<any | null>(null);

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">
                    Pago
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Selecciona el tipo de venta y configura los pagos
                    correspondientes.
                </p>
            </div>

            <div className="mb-8 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="mb-4">
                    <h3 className="font-semibold">
                        Información de venta
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        Configuración general de la operación.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                    <InputText
                        name="exchange_rate"
                        label="Tipo de cambio"
                        register={register}
                        registerOptions={{
                            valueAsNumber: true,
                        }}
                    />
                </div>
                <Controller
                    name="currency_id"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SimpleSelector
                            label="Moneda"
                            value={field.value}
                            options={currencies.map((c) => ({ id: c.id, name: c.name }))}
                            onSelect={field.onChange}
                            error={fieldState.error}
                        />
                    )}
                />
            </div>

            {/* SECCIÓN PAGOS */}
            <div>
                {/* CABECERA */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">
                            Pagos
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            Agrega uno o más métodos de pago para esta venta.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={addPayment}
                        className="w-full sm:w-auto"
                    >
                        + Agregar pago
                    </Button>
                </div>

                {/* LISTA DE PAGOS */}
                <div className="space-y-4">
                    {fields.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
                                💳
                            </div>

                            <h4 className="font-medium">
                                No hay pagos registrados
                            </h4>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Agrega un pago para continuar con la venta.
                            </p>

                            <Button
                                type="button"
                                variant="outline"
                                className="mt-4"
                                onClick={addPayment}
                            >
                                + Agregar primer pago
                            </Button>
                        </div>
                    ) : (
                        fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                            >
                                {/* HEADER DEL PAGO */}
                                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                            {index + 1}
                                        </div>

                                        <div>
                                            <h4 className="font-semibold">
                                                Pago #{index + 1}
                                            </h4>

                                            <p className="text-xs text-muted-foreground">
                                                Información del método de pago
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        Eliminar
                                    </button>
                                </div>

                                {/* CONTENIDO */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {/* CUENTA */}
                                        <div className="sm:col-span-2 lg:col-span-1">
                                            <Controller
                                                name={`payments.${index}.payment_account_id`}
                                                control={control}
                                                render={({
                                                    field,
                                                    fieldState,
                                                }) => (
                                                    <SimpleSelector
                                                        label="Cuenta de pago"
                                                        value={field.value}
                                                        options={data.map(
                                                            (account) => ({
                                                                id: account.id,
                                                                name: account.name,
                                                            })
                                                        )}
                                                        onSelect={field.onChange}
                                                        error={fieldState.error}
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* MONEDA */}
                                        <Controller
                                            name={`payments.${index}.currency_id`}
                                            control={control}
                                            render={({
                                                field,
                                                fieldState,
                                            }) => (
                                                <SimpleSelector
                                                    label="Moneda"
                                                    value={field.value}
                                                    options={currencies.map(
                                                        (currency) => ({
                                                            id: currency.id,
                                                            name: currency.name,
                                                        })
                                                    )}
                                                    onSelect={field.onChange}
                                                    error={fieldState.error}
                                                />
                                            )}
                                        />

                                        {/* MONTO */}
                                        <InputText
                                            name={`payments.${index}.amount`}
                                            label="Monto"
                                            register={register}
                                            registerOptions={{
                                                valueAsNumber: true,
                                            }}
                                        />

                                        {/* TIPO DE CAMBIO */}
                                        <InputText
                                            name={`payments.${index}.exchange_rate`}
                                            label="Tipo de cambio"
                                            register={register}
                                            registerOptions={{
                                                valueAsNumber: true,
                                            }}
                                        />
                                    </div>

                                    {/* NOTAS */}
                                    <div className="mt-4">
                                        <InputText
                                            name={`payments.${index}.notes`}
                                            label="Notas"
                                            register={register}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* RESUMEN */}
                {fields.length > 0 && (
                    <div className="mt-5 rounded-2xl border bg-primary/5 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Pagos registrados
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {fields.length}{" "}
                                    {fields.length === 1
                                        ? "pago"
                                        : "pagos"}{" "}
                                    configurado
                                    {fields.length === 1 ? "" : "s"}
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addPayment}
                                className="w-full sm:w-auto"
                            >
                                + Agregar otro pago
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* NAVEGACIÓN */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    className="w-full rounded-md border px-4 py-2 text-sm transition-colors hover:bg-muted sm:w-auto"
                    onClick={() =>
                        router.push("/sales/sale/add/cliente")
                    }
                >
                    Anterior
                </button>

                <button
                    type="button"
                    className="w-full rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 sm:w-auto"
                    onClick={handleSubmit(
                        onSubmit,
                        (errors) => {
                            console.log(
                                "❌ ERRORES DE VALIDACIÓN:",
                                errors
                            );
                        }
                    )}
                >
                    Guardar venta
                </button>
                <TicketFormModal
                    open={ticketOpen}
                    onOpenChange={setTicketOpen}
                    sale={createdSale}
                    onSuccess={async () => {
                        useSaleStore.getState().startNew();
                        setTicketOpen(false);
                        setSuccessDialogOpen(false);
                        router.push("/sales/sale");
                    }}
                />

                <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                    <DialogContent className="lg:max-w-md sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Venta creada correctamente</DialogTitle>
                        </DialogHeader>

                        <div className="mt-2 flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">La venta se creó correctamente.</p>

                            <div className="flex gap-2">
                                {createdSale?.notaPedidoBase64 && (
                                    <Button
                                        onClick={() => openPdf(createdSale.notaPedidoBase64)}
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
                                >
                                    Emitir boleta
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        useSaleStore.getState().startNew();
                                        setSuccessDialogOpen(false);
                                        router.push("/sales/sale");
                                    }}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
