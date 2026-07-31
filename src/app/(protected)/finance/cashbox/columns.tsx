"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import Swal from "sweetalert2"
import { useCurrencyStore } from "@/modules/finances/currency/store/currency.store"
import { currencyService } from "@/modules/finances/currency/services/currency.service"
import { Cashbox } from "@/modules/finances/cashbox/types/cashbox.types"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Cashbox>[] => [
    {
        accessorFn: (row) => row.id,
        id: "id",
        header: "id",
    },
    {
        accessorFn: (row) => row.company_id,
        id: "empresa",
        header: "Empresa",
    },
    {
        accessorFn: (row) => row.notes,
        id: "notas",
        header: "Notas",
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
   /*  {
        id: "Opciones",
        header: "Opciones",
        cell: ({ row }) => {
            const currency = row.original;
            const { openEdit } = useCurrencyStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: currency.name,
                    code: currency.code,
                    symbol: currency.symbol,
                    is_base: currency.is_base,
                }, currency.id);
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará la moneda "${currency.name}" de forma permanente.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar",
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
                    await currencyService.delete(currency.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La moneda fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Moneda eliminada correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar la moneda.",
                        icon: "error"
                    });

                    notify("Error al eliminar la moneda", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar moneda">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar moneda">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    } */
]