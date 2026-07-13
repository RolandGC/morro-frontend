"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types"
import { useWarehouseStore } from "@/modules/core/warehouses/store/warehouse.store"
import Swal from "sweetalert2"
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service"
import { Brand } from "@/modules/inventory/brands/types/brand.types"
import { useBrandStore } from "@/modules/inventory/brands/store/brand.store"
import { brandService } from "@/modules/inventory/brands/services/brands.service"

interface ColumnsProps {
    fetchBrands: () => Promise<void>;
}

export const getColumns = ({ fetchBrands }: ColumnsProps): ColumnDef<Brand>[] => [
    {
        accessorFn: (row) => row.name,
        id: "nombre",
        header: "Marca",
    },
    /* {
        accessorFn: (row) => row.address,
        id: "dirección",
        header: "Dirección",
    }, */
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
            const brand = row.original;
            const { openEdit } = useBrandStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: brand.name,
                    is_active: brand.is_active,
                }, brand.id);

            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará la marca "${brand.name}" de forma permanente.`,
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
                    await brandService.delete(brand.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La marca fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Alamacén eliminado correctamente", "success", 3000);

                    await fetchBrands();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar el marca.",
                        icon: "error"
                    });

                    notify("Error al eliminar la marca", "error", 3000);
                    console.error(error);
                }
            };


            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar marca">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar marca">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]