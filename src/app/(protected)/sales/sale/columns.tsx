"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, Printer, Check, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import Swal from "sweetalert2"
import { Supplier } from "@/modules/purchases/suppliers/types/suppliers.types"
import { useSupplierStore } from "@/modules/purchases/suppliers/store/supplier.store"
import { supplierService } from "@/modules/purchases/suppliers/services/supplier.service"
import { Purchase } from "@/modules/purchases/purchase/types/purchase.types"
import { Sale } from "@/modules/sales/sale/types/sale.types"
import { translateSaleStatus } from "@/modules/sales/sale/utils"
import { saleService } from "@/modules/sales/sale/services/sale.service"
import { useReceiptStore } from "@/modules/sales/sale/store/ticket.store"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Sale>[] => [
    {
        accessorFn: (row) => row.issued_documents?.[0]?.series + '-' + row.issued_documents?.[0]?.number,
        id: "Serie",
        header: "Serie",
    },
    {
        accessorFn: (row) => row.customers.full_name,
        id: "Cliente",
        header: "Cliente",
    },
    /* {
        accessorFn: (row) => row.companies.name,
        id: "Empresa",
        header: "Empresa",
    }, */
    {
        accessorFn: (row) => formatDate(row.sale_date),
        id: "Fecha",
        header: "Fecha de venta",
    },
    {
        accessorFn: (row) => translateSaleStatus(row.status),
        id: "Estado",
        header: "Estado",
    },
    {
        id: "Opciones",
        header: "Opciones",
        cell: ({ row }) => {
            const sale = row.original;
            //const { openEdit } = useSupplierStore();
            const { notify } = useToast();
            const { openCreate } = useReceiptStore();


            const handleConfirm = async () => {

                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se confirmará la venta "${sale.status}".`,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Sí, confirmar",
                    cancelButtonText: "Cancelar",
                    reverseButtons: true,
                    customClass: {
                        confirmButton:
                            "bg-green-600 hover:bg-gray-300 text-white font-medium px-4 py-2 rounded-lg ml-2",
                        cancelButton:
                            "bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg mr-2",
                    },
                    buttonsStyling: false
                });

                // Si el usuario cancela
                if (!result.isConfirmed) {
                    return;
                }

                try {
                    await saleService.complete(sale?.id);

                    await Swal.fire({
                        title: "¡Confirmado!",
                        text: "La venta fue confirmado correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Venta confirmada correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo confirmar la venta.",
                        icon: "error"
                    });

                    notify("Error al confirmar la venta", "error", 3000);
                    console.error(error);
                }
            };

            const handleCancel = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se cancelará la venta "${sale.total}" de forma permanente.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, cancelar",
                    cancelButtonText: "No, volver",
                    reverseButtons: true,
                    customClass: {
                        confirmButton:
                            "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg ml-2",
                        cancelButton:
                            "bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg mr-2",
                    },
                    buttonsStyling: false
                });

                // Si el usuario cancela
                if (!result.isConfirmed) {
                    return;
                }

                try {
                    await saleService.cancel(sale?.id);

                    await Swal.fire({
                        title: "¡Cancelar!",
                        text: "La venta fue cancelada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Venta cancelada correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo cancelar la venta.",
                        icon: "error"
                    });

                    notify("Error al cancelar la venta", "error", 3000);
                    console.error(error);
                }
            };

            const handlePrint = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se va imprimir "${sale.total}".`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, imprimir",
                    cancelButtonText: "No, volver",
                    reverseButtons: true,
                    customClass: {
                        confirmButton:
                            "bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg ml-2",
                        cancelButton:
                            "bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg mr-2",
                    },
                    buttonsStyling: false,
                });

                if (!result.isConfirmed) return;

                try {
                    const response = await saleService.getNoteById(sale.id);

                    const notaPedidoBase64 =
                        response.data?.base64;

                    if (!notaPedidoBase64) {
                        throw new Error("No se recibió el comprobante.");
                    }

                    openPdf(notaPedidoBase64);

                    notify(
                        "Comprobante abierto correctamente",
                        "success",
                        3000
                    );

                } catch (error) {
                    console.error(error);

                    Swal.fire({
                        title: "Error",
                        text: "No se pudo abrir el comprobante de la venta.",
                        icon: "error",
                    });

                    notify(
                        "Error al imprimir la venta",
                        "error",
                        3000
                    );
                }
            };

            const openPdf = (base64: string) => {
                const cleanBase64 = base64.includes(",")
                    ? base64.split(",")[1]
                    : base64;

                const byteCharacters = atob(cleanBase64);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);

                const blob = new Blob([byteArray], {
                    type: "application/pdf",
                });

                const pdfUrl = URL.createObjectURL(blob);

                window.open(pdfUrl, "_blank");

                setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                }, 10000);
            };

            const handleEmit = async () => {
                try {
                    const response = await saleService.getById(sale.id);

                    if (response.status !== 200) {
                        throw new Error("No se pudo obtener la venta");
                    }

                    const saleData = response.data;

                    console.log("VENTA PARA EMITIR:", saleData);

                    // Open the global receipt modal using the store
                    openCreate(saleData.id);

                } catch (error) {
                    console.error("Error obteniendo venta:", error);

                    notify(
                        "No se pudo obtener la información de la venta",
                        "error",
                        3000
                    );
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Acciones"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-52"
                    >
                        <DropdownMenuLabel>
                            Acciones
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleConfirm}
                            disabled={sale.status !== "pending"}
                            className="cursor-pointer"
                        >
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                            Confirmar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleCancel}
                            disabled={sale.status !== "pending"}
                            className="cursor-pointer"
                        >
                            <X className="mr-2 h-4 w-4 text-red-600" />
                            Cancelar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handlePrint}
                            //disabled={sale.status !== "pending"}
                            className="cursor-pointer"
                        >
                            <Printer className="mr-2 h-4 w-4 text-gray-600" />
                            Imprimir NP
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleEmit}
                            //disabled={sale.status !== "pending"}
                            className="cursor-pointer"
                        >
                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                            Boletas
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

        },
    }
]