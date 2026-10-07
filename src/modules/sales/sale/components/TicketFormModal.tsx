"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { saleService } from "../services/sale.service";
import { TicketForm } from "../validators/saleSchema";
import { ArrowLeft, ArrowLeftRight, CheckCircle2, Download, Eye, FileText, Loader2, Lock, } from "lucide-react";
import { IssuedDocument, SaleDetail } from "../types/sale.types";
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
    issuedDocument?: {
        id: string;
        document_type?: string;
        series?: string;
        number?: string | number;
    } | null;
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

type ModalView = "form" | "issued";

function base64ToPdfUrl(base64: string) {
    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const byteChars = atob(cleanBase64);
    const byteNumbers = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
    }

    return URL.createObjectURL(
        new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" })
    );
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
    const [issuedComprobante, setIssuedComprobante] =
        useState<ComprobantePdf | null>(null);
    const [changingCustomer, setChangingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [view, setView] = useState<ModalView>("form");

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

    const selectedItemIds =
        useWatch({ control, name: "sale_item_ids" }) ?? [];

    const mapSaleItems = (saleData: SaleDetail): LocalSaleItem[] =>
        (saleData.sale_items ?? []).map((item: any, index: number) => {
            const issuedDocumentItem = item.issued_document_items ?? null;
            const issuedDocument = issuedDocumentItem?.issued_documents;

            return {
                id: item.id ?? item.product_id ?? String(index),
                label: [
                    item.products?.name ?? item.product_name,
                    item.products?.model,
                    item.product_units?.name,
                ]
                    .filter(Boolean)
                    .join(" - "),
                regime: item.products?.regime,
                issuedDocument: issuedDocument
                    ? {
                        id: issuedDocument.id,
                        document_type: issuedDocument.document_type,
                        series: issuedDocument.series,
                        number: issuedDocument.number,
                    }
                    : null,
            };
        });

    const initializeSale = (saleData: SaleDetail) => {
        setSale(saleData);
        setItems(mapSaleItems(saleData));
        setChangingCustomer(false);
        setSelectedCustomer(
            saleData.customers
                ? { ...saleData.customers, id: saleData.customer_id }
                : null
        );
        reset({
            sale_id: saleData.id,
            customer_id: saleData.customer_id,
            sale_item_ids: [],
        });
    };

    const loadSale = async (id?: string) => {
        const targetId = id ?? saleId ?? saleFromProps?.id ?? sale?.id;
        if (!targetId) return;

        try {
            setLoadingSale(true);

            const response = await saleService.getById(targetId);
            if (response.status !== 200)
                throw new Error("No se pudo obtener la venta");

            initializeSale(response.data);
        } catch (error) {
            console.error("Error cargando información de la venta:", error);
            notify("No se pudo cargar la información de la venta", "error");
            setSale(null);
            setItems([]);
            reset({ sale_id: "", customer_id: "", sale_item_ids: [] });
        } finally {
            setLoadingSale(false);
        }
    };

    useEffect(() => {
        if (!open) return;

        setView("form");
        setIssuedComprobante(null);

        if (saleFromProps) initializeSale(saleFromProps);
        else if (saleId) loadSale();
    }, [open, saleId, saleFromProps]);

    useEffect(() => {
        if (open) return;

        setSale(null);
        setItems([]);
        setLoadingSale(false);
        setView("form");
        setIssuedComprobante(null);
        setChangingCustomer(false);
        setSelectedCustomer(null);

        reset({
            sale_id: "",
            customer_id: "",
            sale_item_ids: [],
        });
    }, [open, reset]);

    useEffect(
        () => () => {
            if (issuedComprobante?.url)
                URL.revokeObjectURL(issuedComprobante.url);
        },
        [issuedComprobante]
    );

    const issuedBoletas: IssuedDocument[] = (
        sale?.issued_documents ?? []
    ).filter((document) => document.document_type?.startsWith("boleta"));

    const availableItems = items.filter((item) => !item.issuedDocument);

    const toggleItem = (id: string) => {
        const newValue = selectedItemIds.includes(id)
            ? selectedItemIds.filter((itemId) => itemId !== id)
            : [...selectedItemIds, id];

        setValue("sale_item_ids", newValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const allItemsSelected =
        availableItems.length > 0 &&
        selectedItemIds.length === availableItems.length;

    const someItemsSelected =
        selectedItemIds.length > 0 &&
        selectedItemIds.length < availableItems.length;

    const toggleAllItems = () => {
        setValue(
            "sale_item_ids",
            allItemsSelected ? [] : availableItems.map((item) => item.id),
            {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            }
        );
    };

    const onSubmit = async (payload: TicketForm) => {
        try {
            const response = await saleService.createTicket(payload);

            if (response.status !== 200 && response.status !== 201)
                throw new Error("No se pudo emitir la boleta");

            const data: ComprobanteResponse[] = Array.isArray(response.data)
                ? response.data
                : [response.data];

            if (!data.length)
                throw new Error("El backend no devolvió el comprobante");

            const comprobante = data[data.length - 1];

            setIssuedComprobante({
                ...comprobante,
                url: base64ToPdfUrl(comprobante.base64),
            });

            setView("issued");
            notify("Boleta emitida correctamente", "success");
            onSuccess?.();
        } catch (error) {
            console.error("Error al emitir la boleta:", error);
            notify("Error al emitir la boleta", "error");
        }
    };

    const handleBackToList = async () => {
        setView("form");
        setIssuedComprobante(null);
        await loadSale();
    };

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) {
            if (issuedComprobante?.url)
                URL.revokeObjectURL(issuedComprobante.url);

            setIssuedComprobante(null);
            setView("form");
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

    const handleCancelCustomerChange = () => setChangingCustomer(false);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg lg:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {view === "issued" ? "Boleta emitida" : "Emitir boleta"}
                    </DialogTitle>
                </DialogHeader>

                {loadingSale ? (
                    <div className="flex min-h-50 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Cargando información de la venta...
                            </p>
                        </div>
                    </div>
                ) : view === "issued" ? (
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-green-100 p-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-green-800">
                                        Boleta emitida correctamente
                                    </p>
                                    <p className="mt-1 text-sm text-green-700">
                                        El comprobante fue generado correctamente.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {issuedComprobante && (
                            <div className="rounded-xl border bg-background p-5">
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {issuedComprobante.regime} —{" "}
                                                {issuedComprobante.serie}-{issuedComprobante.numero}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Comprobante recién emitido
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-muted/40 p-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">
                                                {issuedComprobante.subtotal}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex justify-between text-sm">
                                            <span className="text-muted-foreground">IGV</span>
                                            <span className="font-medium">
                                                {issuedComprobante.igv}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex justify-between border-t pt-3">
                                            <span className="font-semibold">Total</span>
                                            <span className="text-lg font-bold">
                                                {issuedComprobante.total}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() =>
                                                window.open(issuedComprobante.url, "_blank")
                                            }
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Visualizar
                                        </Button>

                                        <a
                                            href={issuedComprobante.url}
                                            download={`${issuedComprobante.serie}-${issuedComprobante.numero}.pdf`}
                                            className="flex-1"
                                        >
                                            <Button type="button" className="w-full">
                                                <Download className="mr-2 h-4 w-4" />
                                                Descargar
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBackToList}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver a boletas
                                </Button>

                                <Button type="button" onClick={() => handleClose(false)}>
                                    Cerrar
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-6">
                        {issuedBoletas.length > 0 && (
                            <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                                <div className="mb-4 flex items-start gap-3">
                                    <div className="rounded-full bg-green-100 p-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-800">
                                            Boletas emitidas
                                        </p>
                                        <p className="text-sm text-green-700">
                                            Comprobantes registrados para esta venta.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {issuedBoletas.map((boleta) => (
                                        <div
                                            key={boleta.id}
                                            className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <p className="font-semibold">
                                                        Boleta {boleta.series}-{boleta.number}
                                                    </p>
                                                </div>

                                                {boleta.snapshot_json?.customerName && (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Cliente: {boleta.snapshot_json.customerName}
                                                    </p>
                                                )}

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Subtotal: {boleta.subtotal ?? "0.00"} · IGV:{" "}
                                                    {boleta.igv ?? "0.00"} · Total:{" "}
                                                    {boleta.total ?? "0.00"}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 gap-2">
                                                {boleta.pdf_base64 ? (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const url = base64ToPdfUrl(boleta.pdf_base64!);
                                                                window.open(url, "_blank");
                                                                setTimeout(
                                                                    () => URL.revokeObjectURL(url),
                                                                    60000
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => {
                                                                const url = base64ToPdfUrl(boleta.pdf_base64!);
                                                                const link = document.createElement("a");

                                                                link.href = url;
                                                                link.download = `${boleta.series}-${boleta.number}.pdf`;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);

                                                                setTimeout(
                                                                    () => URL.revokeObjectURL(url),
                                                                    1000
                                                                );
                                                            }}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Descargar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        PDF no disponible
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex w-full flex-col gap-6"
                        >
                            <input type="hidden" {...register("sale_id")} />
                            <input type="hidden" {...register("customer_id")} />

                            {selectedCustomer && !changingCustomer && (
                                <div className="rounded-xl border bg-muted/30 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Cliente</p>
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

                            <div>
                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold">Ítems de la venta</p>
                                        <p className="text-sm text-muted-foreground">
                                            Selecciona los productos pendientes que deseas incluir
                                            en la boleta.
                                        </p>
                                    </div>

                                    {items.length > 0 && (
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {selectedItemIds.length} de {availableItems.length}{" "}
                                                disponibles
                                            </p>

                                            {items.length - availableItems.length > 0 && (
                                                <p className="text-xs text-green-600">
                                                    {items.length - availableItems.length} ya emitido(s)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {items.length === 0 ? (
                                    <div className="rounded-xl border border-dashed p-5 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            No se encontraron ítems para esta venta.
                                        </p>
                                    </div>
                                ) : availableItems.length === 0 ? (
                                    <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
                                        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
                                        <p className="font-semibold text-green-700">
                                            Todos los productos ya fueron emitidos
                                        </p>
                                        <p className="mt-1 text-sm text-green-600">
                                            No existen productos pendientes para emitir otra boleta.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
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
                                                    if (element) element.indeterminate = someItemsSelected;
                                                }}
                                                onChange={toggleAllItems}
                                                className="h-4 w-4"
                                            />

                                            <div className="flex-1">
                                                <p className="font-semibold">Seleccionar todos</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {allItemsSelected
                                                        ? "Todos los ítems pendientes están seleccionados"
                                                        : someItemsSelected
                                                            ? "Hay ítems seleccionados"
                                                            : "Selecciona todos los ítems pendientes"}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                                {selectedItemIds.length}/{availableItems.length}
                                            </span>
                                        </label>

                                        <div className="my-3 border-t" />

                                        {items.map((item) => {
                                            const checked = selectedItemIds.includes(item.id);
                                            const alreadyIssued = !!item.issuedDocument;

                                            return (
                                                <label
                                                    key={item.id}
                                                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${alreadyIssued
                                                            ? "cursor-not-allowed border-green-200 bg-green-50/50 opacity-75"
                                                            : checked
                                                                ? "cursor-pointer border-primary bg-primary/5"
                                                                : "cursor-pointer hover:bg-muted/50"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={alreadyIssued}
                                                        onChange={() => {
                                                            if (!alreadyIssued) toggleItem(item.id);
                                                        }}
                                                        className="h-4 w-4"
                                                    />

                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium">{item.label}</p>

                                                            {alreadyIssued && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-700">
                                                                    <Lock className="h-3 w-3" />
                                                                    Emitido
                                                                </span>
                                                            )}
                                                        </div>

                                                        {item.regime && (
                                                            <p className="text-xs uppercase text-muted-foreground">
                                                                Régimen: {item.regime}
                                                            </p>
                                                        )}

                                                        {alreadyIssued && item.issuedDocument && (
                                                            <p className="mt-1 text-xs text-green-700">
                                                                Boleta: {item.issuedDocument.series}-
                                                                {item.issuedDocument.number}
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

                            {sale && (
                                <div className="rounded-xl border bg-primary/5 p-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Subtotal general
                                        </span>
                                        <span className="font-medium">
                                            {sale.subtotal_general}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Subtotal ZOFRA
                                        </span>
                                        <span className="font-medium">{sale.subtotal_zofra}</span>
                                    </div>

                                    <div className="mt-1 flex justify-between">
                                        <span className="text-sm text-muted-foreground">IGV</span>
                                        <span className="font-medium">{sale.igv}</span>
                                    </div>

                                    <div className="mt-2 flex justify-between border-t pt-2">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-bold">{sale.total}</span>
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <div className="flex w-full justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleClose(false)}
                                    >
                                        Cerrar
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            loadingSale ||
                                            availableItems.length === 0 ||
                                            selectedItemIds.length === 0
                                        }
                                    >
                                        {isSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}

                                        {availableItems.length === 0
                                            ? "Todos emitidos"
                                            : "Emitir boleta"}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}