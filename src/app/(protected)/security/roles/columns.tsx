"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import Swal from "sweetalert2"
import { Role } from "@/modules/security/roles/types/roles.types"
import { useRoleStore } from "@/modules/security/roles/store/role.store"
import { roleService } from "@/modules/security/roles/services/role.service"

interface ColumnsProps {
    fetchRoles: () => Promise<void>;
}

export const getColumns = ({ fetchRoles }: ColumnsProps): ColumnDef<Role>[] => [
    {
        accessorFn: (row) => row.name,
        id: "clave",
        header: "Clave",
    },
    {
        accessorFn: (row) => row.display_name,
        id: "display_name",
        header: "Nombre",
    },
    {
        accessorFn: (row) => row.description,
        id: "descripción",
        header: "Descripción",
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
            const role = row.original;
            const { openEdit } = useRoleStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: role.name,
                    description: role.description,
                    display_name: role.display_name
                }, role.id);
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará el rol "${role.name}" de forma permanente.`,
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
                    await roleService.delete(role.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "el rol fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Rol eliminada correctamente", "success", 3000);

                    await fetchRoles();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar el rol.",
                        icon: "error"
                    });

                    notify("Error al eliminar el rol", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar Rol">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar Rol">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]