"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, CircleCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import Swal from "sweetalert2"
import { Purchase } from "@/modules/purchases/purchase/types/purchase.types"
import { translatePurchaseStatus } from "@/modules/purchases/purchase/utils"
import { purchaseService } from "@/modules/purchases/purchase/services/purchase.service"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Purchase>[] => [
    {
        accessorFn: (row) => row.suppliers?.name,
        id: "Proveedor",
        header: "Proveedor",
    },
    {
        accessorFn: (row) => row.companies.name,
        id: "Empresa",
        header: "Empresa",
    },
    {
        accessorFn: (row) => translatePurchaseStatus(row.status),
        id: "Estado",
        header: "Estado",
    },
    /* {
        accessorFn: (row) => row.model,
        id: "model",
        header: "Modelo",
    },
    {
        accessorFn: (row) => formatDate(row.created_at),
        id: "created_at",
        header: "Fecha de creación",
    }, */
    {
        id: "Opciones",
        header: "Opciones",
        cell: ({ row }) => {
            const purchase = row.original;
            const { notify } = useToast();

            const handleConfirm = async () => {

                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se confirmará la compra "${purchase.reference_doc}".`,
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
                    await purchaseService.complete(purchase.id);

                    await Swal.fire({
                        title: "¡Confirmado!",
                        text: "La compra fue confirmado correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Compra confirmada correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo confirmar la compra.",
                        icon: "error"
                    });

                    notify("Error al confirmar la compra", "error", 3000);
                    console.error(error);
                }
            };

            const handleCancel = async () => {
                const result = await Swal.fire({
                    title: "¿Cancelar compra?",
                    text: `Se cancelará la compra "${purchase.reference_doc}".`,
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
                    await purchaseService.cancel(purchase.id);

                    await Swal.fire({
                        title: "¡Cancelado!",
                        text: "La compra fue cancelada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Compra cancelada correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo cancelar la compra.",
                        icon: "error"
                    });

                    notify("Error al cancelar la compra", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleConfirm}
                        disabled={purchase.status !== "pending"}
                        className="bg-green-700 text-white hover:bg-green-800 hover:text-white text-xs"
                        title="confirmar compra"
                    >
                        Confirmar
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        title="Cancelar compra"
                        disabled={purchase.status !== "pending"}
                        className="bg-red-700 text-white hover:bg-red-800 hover:text-white text-xs"
                    >
                        Cancelar
                    </Button>
                </div>
            );
        },
    }
]