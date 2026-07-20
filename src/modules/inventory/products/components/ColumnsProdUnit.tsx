"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductUnit } from "@/modules/inventory/products/types/produc.type"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import { useProductUnitStore } from "@/modules/inventory/products/store/productUnit.store"
import Swal from "sweetalert2"
import { productUnitService } from "../services/producUnit.service"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<ProductUnit>[] => [
    {
        accessorFn: (row) => row.name,
        id: "name",
        header: "Nombre",
    },
    {
        accessorFn: (row) => row.barcode,
        id: "código de barra",
        header: "Código de barra",
    },
    {
        accessorFn: (row) => formatDate(row.created_at),
        id: "created_at",
        header: "Fecha de creación",
    },
    {
        id: "actions",
        header: "Opciones",
        cell: ({ row }) => {
            const productUnit = row.original;
            const { openEdit, product_id } = useProductUnitStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: productUnit.name,
                    barcode: productUnit.barcode,
                    conversion_factor: productUnit.conversion_factor,
                    is_default: productUnit.is_default,
                }, productUnit.id);

            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará la unidad de producto "${productUnit.name}" de forma permanente.`,
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
                    await productUnitService.delete(product_id ?? '', productUnit.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La marca fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Marca eliminado correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar la unidad de producto.",
                        icon: "error"
                    });

                    notify("Error al eliminar la unidad de producto", "error", 3000);
                    console.error(error);
                }
            };


            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar unidad producto">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar unidad producto">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]