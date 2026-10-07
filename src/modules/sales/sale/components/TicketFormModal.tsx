"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { saleService } from "../services/sale.service";
import { TicketForm } from "../validators/saleSchema";
import { Eye, Download, FileText, Loader2, ArrowLeftRight } from "lucide-react";
import { SaleDetail } from "../types/sale.types";
import { regime } from "@/types/types";
import { Customer } from "../../customers/types/customer.type";
import CustomerSelector from "../../customers/components/CustomerSelector";

interface TicketFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleId?: string;
    sale?: SaleDetail | null;
    onClosed?: () => void;
    onSuccess?: () => void;
}

interface LocalSaleItem {
    id: string;
    label: string;
    regime?: regime;
}

interface ComprobanteResponse {
    regime: regime;
    serie: string;
    numero: number;
    subtotal: number;
    igv: number;
    total: number;
    base64: string;
}

interface ComprobantePdf extends ComprobanteResponse {
    url: string;
}

/**
 * Convierte Base64 PDF a Blob URL.
 */
function base64ToPdfUrl(base64: string): string {
    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const byteChars = atob(cleanBase64);
    const byteNumbers = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    return URL.createObjectURL(blob);
}

export default function TicketFormModal({
    open,
    onOpenChange,
    saleId,
    sale: saleFromProps,
    onClosed,
    onSuccess,
}: TicketFormModalProps) {
    const { notify } = useToast();

    const [sale, setSale] = useState<SaleDetail | null>(saleFromProps ?? null);
    const [items, setItems] = useState<LocalSaleItem[]>([]);
    const [loadingSale, setLoadingSale] = useState(false);
    const [comprobantes, setComprobantes] = useState<ComprobantePdf[]>([]);
    const [changingCustomer, setChangingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setValue,
        control,
    } = useForm<TicketForm>({
        defaultValues: {
            sale_id: "",
            customer_id: "",
            sale_item_ids: [],
        },
    });

    const selectedItemIds = useWatch({
        control,
        name: "sale_item_ids",
    }) ?? [];

    /**
     * Convierte la venta recibida en props
     * a los elementos que necesita el formulario.
     */
    const mapSaleItems = (saleData: SaleDetail): LocalSaleItem[] => {
        return (saleData.sale_items ?? []).map((item: any, idx: number) => ({
            id: item.id ?? item.product_id ?? String(idx),
            label: [
                item.products?.name ?? item.product_name,
                item.products?.model,
                item.product_units?.name,
            ].filter(Boolean).join(" - "),
            regime: item.products?.regime,
        }));
    };

    /**
     * Configura el formulario a partir de una venta.
     */
    const initializeSale = (saleData: SaleDetail) => {
        setSale(saleData);
        setItems(mapSaleItems(saleData));
        setChangingCustomer(false);

        setSelectedCustomer(
            saleData.customers
                ? {
                    ...saleData.customers,
                    id: saleData.customer_id,
                }
                : null
        );

        reset({
            sale_id: saleData.id,
            customer_id: saleData.customer_id,
            sale_item_ids: [],
        });
    };
    /**
     * Carga la venta.
     *
     * Prioridad:
     *
     * 1. Venta recibida por props.
     * 2. saleId -> consultar backend.
     */
    useEffect(() => {
        if (!open) return;

        if (saleFromProps) {
            initializeSale(saleFromProps);
            return;
        }

        if (!saleId) {
            setSale(null);
            setItems([]);

            reset({
                sale_id: "",
                customer_id: "",
                sale_item_ids: [],
            });

            return;
        }

        let cancelled = false;

        const loadSale = async () => {
            try {
                setLoadingSale(true);

                const response = await saleService.getById(saleId);

                if (response.status !== 200) {
                    throw new Error("No se pudo obtener la venta");
                }

                if (cancelled) return;

                const saleData: SaleDetail = response.data;
                initializeSale(saleData);
            } catch (error) {
                if (cancelled) return;

                console.error("Error cargando información de la venta:", error);
                notify("No se pudo cargar la información de la venta", "error");

                setSale(null);
                setItems([]);

                reset({
                    sale_id: "",
                    customer_id: "",
                    sale_item_ids: [],
                });
            } finally {
                if (!cancelled) {
                    setLoadingSale(false);
                }
            }
        };

        loadSale();

        return () => {
            cancelled = true;
        };
    }, [open, saleId, saleFromProps, reset, notify]);

    /**
     * Cuando se cierra el modal limpiamos
     * los datos internos.
     */
    useEffect(() => {
        if (open) return;

        setSale(null);
        setItems([]);
        setLoadingSale(false);
        setComprobantes([]);

        reset({
            sale_id: "",
            customer_id: "",
            sale_item_ids: [],
        });
    }, [open, reset]);


    /**
     * Limpieza de Blob URLs.
     */
    useEffect(() => {
        return () => {
            comprobantes.forEach((comprobante) => {
                URL.revokeObjectURL(comprobante.url);
            });
        };
    }, [comprobantes]);

    /**
     * Seleccionar / deseleccionar item.
     */
    const toggleItem = (id: string) => {
        const current = selectedItemIds;
        const newValue = current.includes(id)
            ? current.filter((itemId) => itemId !== id)
            : [...current, id];

        setValue("sale_item_ids", newValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    /**
 * Indica si todos los ítems están seleccionados.
 */
    const allItemsSelected =
        items.length > 0 &&
        selectedItemIds.length === items.length;

    /**
     * Indica si hay algunos ítems seleccionados.
     */
    const someItemsSelected =
        selectedItemIds.length > 0 &&
        selectedItemIds.length < items.length;

    /**
     * Seleccionar / deseleccionar todos los ítems.
     */
    const toggleAllItems = () => {
        if (allItemsSelected) {
            setValue("sale_item_ids", [], {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });

            return;
        }

        setValue(
            "sale_item_ids",
            items.map((item) => item.id),
            {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            }
        );
    };


    /**
     * Emitir boleta.
     */
    const onSubmit = async (
        payload: TicketForm
    ) => {
        try {
            const response =
                await saleService.createTicket(
                    payload
                );

            if (
                response.status !== 200 &&
                response.status !== 201
            ) {
                throw new Error(
                    "No se pudo emitir la boleta"
                );
            }

            const data: ComprobanteResponse[] =
                Array.isArray(response.data)
                    ? response.data
                    : [response.data];

            const mapped: ComprobantePdf[] =
                data.map((comprobante) => ({
                    ...comprobante,
                    url: base64ToPdfUrl(
                        comprobante.base64
                    ),
                }));

            setComprobantes(mapped);

            notify(
                "Boleta(s) emitida(s) correctamente",
                "success"
            );

            // notify parent if provided
            onSuccess?.();
        } catch (error) {
            console.error(
                "Error al emitir la boleta:",
                error
            );

            notify(
                "Error al emitir la boleta",
                "error"
            );
        }
    };

    /**
     * Cierra el modal.
     */
    const handleClose = (
        nextOpen: boolean
    ) => {
        if (!nextOpen) {
            comprobantes.forEach(
                (comprobante) => {
                    URL.revokeObjectURL(
                        comprobante.url
                    );
                }
            );

            setComprobantes([]);

            onClosed?.();
        }

        onOpenChange(nextOpen);
    };

    const handleCustomerChange = (customer: Customer) => {
        setSelectedCustomer(customer);

        setValue("customer_id", customer.id, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });

        setChangingCustomer(false);
    };

    const handleCancelCustomerChange = () => {
        setChangingCustomer(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg lg:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Emitir boleta
                    </DialogTitle>
                </DialogHeader>

                {/* ========================================== */}
                {/* CARGANDO */}
                {/* ========================================== */}

                {loadingSale ? (
                    <div className="flex min-h-50 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />

                            <p className="text-sm text-muted-foreground">
                                Cargando información de la venta...
                            </p>
                        </div>
                    </div>
                ) : comprobantes.length === 0 ? (
                    /* ========================================== */
                    /* FORMULARIO */
                    /* ========================================== */
                    <form
                        onSubmit={handleSubmit(
                            onSubmit
                        )}
                        className="flex w-full flex-col gap-5"
                    >
                        <input
                            type="hidden"
                            {...register("sale_id")}
                        />

                        <input
                            type="hidden"
                            {...register(
                                "customer_id"
                            )}
                        />

                        {/* ========================================== */}
                        {/* CLIENTE */}
                        {/* ========================================== */}

                            {selectedCustomer && !changingCustomer && (
                                <div className="rounded-xl border bg-muted/30 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Cliente
                                            </p>

                                            <p className="font-semibold">
                                                {selectedCustomer.full_name}
                                            </p>

                                            {selectedCustomer.doc_number && (
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedCustomer.doc_type?.toUpperCase()}{" "}
                                                    {selectedCustomer.doc_number}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setChangingCustomer(true)}
                                        >
                                            <ArrowLeftRight className="mr-2 h-4 w-4" />
                                            Cambiar cliente
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {changingCustomer && (
                                <CustomerSelector
                                    currentCustomerId={selectedCustomer?.id}
                                    onSelect={handleCustomerChange}
                                    onCancel={handleCancelCustomerChange}
                                />
                            )}

                            {/* ========================================== */}
                            {/* ITEMS */}
                            {/* ========================================== */}

                            <div>
                                <div className="mb-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                Ítems de la venta
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                Selecciona los productos que deseas
                                                incluir en la boleta.
                                            </p>
                                        </div>

                                        {items.length > 0 && (
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {selectedItemIds.length} de {items.length}{" "}
                                                seleccionados
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {items.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-5 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            No se encontraron ítems para esta venta.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {/* ========================================== */}
                                        {/* SELECCIONAR TODOS */}
                                        {/* ========================================== */}

                                        <label
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${allItemsSelected
                                                    ? "border-primary bg-primary/5"
                                                    : someItemsSelected
                                                        ? "border-primary/50 bg-primary/5"
                                                        : "bg-muted/30 hover:bg-muted/50"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={allItemsSelected}
                                                ref={(element) => {
                                                    if (element) {
                                                        element.indeterminate =
                                                            someItemsSelected;
                                                    }
                                                }}
                                                onChange={toggleAllItems}
                                                className="h-4 w-4"
                                            />

                                            <div className="flex-1">
                                                <p className="font-semibold">
                                                    Seleccionar todos
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {allItemsSelected
                                                        ? "Todos los ítems están seleccionados"
                                                        : someItemsSelected
                                                            ? "Hay ítems seleccionados"
                                                            : "Selecciona todos los ítems de la venta"}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                {selectedItemIds.length}/{items.length}
                                            </span>
                                        </label>

                                        {/* ========================================== */}
                                        {/* SEPARADOR */}
                                        {/* ========================================== */}

                                        <div className="my-3 border-t" />

                                        {/* ========================================== */}
                                        {/* ITEMS */}
                                        {/* ========================================== */}

                                        {items.map((item) => {
                                            const checked =
                                                selectedItemIds.includes(item.id);

                                            return (
                                                <label
                                                    key={item.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${checked
                                                            ? "border-primary bg-primary/5"
                                                            : "hover:bg-muted/50"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() =>
                                                            toggleItem(item.id)
                                                        }
                                                        className="h-4 w-4"
                                                    />

                                                    <div className="flex-1">
                                                        <p className="font-medium">
                                                            {item.label}
                                                        </p>

                                                        {item.regime && (
                                                            <p className="text-xs uppercase text-muted-foreground">
                                                                Régimen: {item.regime}
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {errors.sale_item_ids && (
                                    <p className="mt-2 text-[13px] text-red-500">
                                        {errors.sale_item_ids.message as string}
                                    </p>
                                )}
                            </div>

                        {/* ========================================== */}
                        {/* RESUMEN */}
                        {/* ========================================== */}

                        {sale && (
                            <div className="rounded-xl border bg-primary/5 p-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Subtotal general
                                    </span>

                                    <span className="font-medium">
                                        {
                                            sale.subtotal_general
                                        }
                                    </span>
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Subtotal ZOFRA
                                    </span>

                                    <span className="font-medium">
                                        {
                                            sale.subtotal_zofra
                                        }
                                    </span>
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        IGV
                                    </span>

                                    <span className="font-medium">
                                        {sale.igv}
                                    </span>
                                </div>

                                <div className="mt-2 flex justify-between border-t pt-2">
                                    <span className="font-semibold">
                                        Total
                                    </span>

                                    <span className="font-bold">
                                        {sale.total}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ========================================== */}
                        {/* FOOTER */}
                        {/* ========================================== */}

                        <DialogFooter>
                            <div className="flex w-full justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        handleClose(
                                            false
                                        )
                                    }
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        loadingSale ||
                                        items.length ===
                                        0
                                    }
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}

                                    Emitir boleta
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                ) : (
                    /* ========================================== */
                    /* COMPROBANTES */
                    /* ========================================== */
                    <div className="flex flex-col gap-5">
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <p className="font-semibold text-green-700">
                                ¡Boleta emitida
                                correctamente!
                            </p>

                            <p className="mt-1 text-sm text-green-600">
                                Puedes visualizar o
                                descargar los
                                comprobantes
                                generados.
                            </p>
                        </div>

                        {comprobantes.map(
                            (comprobante) => (
                                <div
                                    key={`${comprobante.serie}-${comprobante.numero}`}
                                    className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="flex items-center gap-2 font-semibold">
                                            <FileText className="h-4 w-4 text-muted-foreground" />

                                            {comprobante.regime.toUpperCase()}{" "}
                                            —{" "}
                                            {
                                                comprobante.serie
                                            }
                                            -
                                            {
                                                comprobante.numero
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Subtotal:{" "}
                                            {
                                                comprobante.subtotal
                                            }{" "}
                                            · IGV:{" "}
                                            {
                                                comprobante.igv
                                            }{" "}
                                            · Total:{" "}
                                            {
                                                comprobante.total
                                            }
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            title="Ver comprobante"
                                            aria-label="Ver comprobante"
                                            onClick={() =>
                                                window.open(
                                                    comprobante.url,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        <a
                                            href={
                                                comprobante.url
                                            }
                                            download={`${comprobante.serie}-${comprobante.numero}.pdf`}
                                        >
                                            <Button
                                                type="button"
                                                size="icon"
                                                title="Descargar"
                                                aria-label="Descargar comprobante"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            )
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() =>
                                    handleClose(
                                        false
                                    )
                                }
                            >
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
