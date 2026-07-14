"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import Swal from "sweetalert2"
import { Brand } from "@/modules/inventory/brands/types/brand.types"
import { brandService } from "@/modules/inventory/brands/services/brands.service"
import { useBrandStore } from "@/modules/inventory/brands/store/brand.store"
import { Category } from "@/modules/core/category/types/category.types"
import { useCategoryStore } from "@/modules/core/category/store/category.store"
import { categoryService } from "@/modules/core/category/services/category.service"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Category>[] => [
    {
        accessorFn: (row) => row.name,
        id: "nombre",
        header: "Categoría",
    },
    {
        accessorFn: (row) => row.description,
        id: "Descripción",
        header: "Descripción",
    },
    {
        accessorFn: (row) => formatDate(row.created_at),
        id: "Fecha Creación",
        header: "Fecha Creación",
    },
    // {
    //     accessorFn: (row) => formatDate(row.created_at),
    //     id: "created_at",
    //     header: "Fecha de creación",
    // },
    {
        id: "opciones",
        header: "Opciones",
        cell: ({ row }) => {
            const category = row.original;
            const { openEdit } = useCategoryStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: category.name,
                    description: category.description,
                    parent_id: category.parent_id,
                }, category.id);

            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará la categoría "${category.name}" de forma permanente.`,
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
                    await categoryService.delete(category.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La categoría fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Categoría eliminado correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar la categoría.",
                        icon: "error"
                    });

                    notify("Error al eliminar la categoría", "error", 3000);
                    console.error(error);
                }
            };


            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar categoría">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar categoría">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]