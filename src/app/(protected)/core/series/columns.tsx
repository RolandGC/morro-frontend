"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import Swal from "sweetalert2"
import { Serie } from "@/modules/core/series/types/serie.types"
import { useSerieStore } from "@/modules/core/series/store/serie.store"
import { serieService } from "@/modules/core/series/services/serie.service"
import { translateSerieType } from "@/modules/core/series/utils"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Serie>[] => [
    {
        accessorFn: (row) => row.series,
        id: "Numero",
        header: "Número",
    },
    
    {
        accessorFn: (row) => translateSerieType(row.type),
        id: "tipo",
        header: "Tipo",
    },
    {
        accessorFn: (row) => row.users.name,
        id: "usuario",
        header: "Usuario",
    },
   
    {
        id: "Opciones",
        header: "Opciones",
        cell: ({ row }) => {
            const serie = row.original;
            const { openEdit } = useSerieStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    series: serie.series,
                    next_number: serie.next_number,
                    user_id: serie.user_id,
                    type: serie.type,
                }, serie.id);
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará la serie "${serie.series}" de forma permanente.`,
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
                    await serieService.delete(serie.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La serie fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("serie eliminada correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar la serie.",
                        icon: "error"
                    });

                    notify("Error al eliminar la serie", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar serie">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar serie">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]