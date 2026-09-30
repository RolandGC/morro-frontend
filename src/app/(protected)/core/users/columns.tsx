"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import { User } from "@/modules/core/user/types/user.types"
import { useUserStore } from "@/modules/core/user/store/user.store"
import { userService } from "@/modules/core/user/services/user.service"
import Swal from "sweetalert2"

interface ColumnsProps {
    fetchUsers: () => Promise<void>
}
export const getColumns = ({ fetchUsers }: ColumnsProps): ColumnDef<User>[] => [

    /* {
        accessorKey: "name",
        header: "Nombre",
    }, */
    {
        accessorFn: (row) => row.name,
        id: "Nombres",
        header: "Nombres",
    },
    {
        accessorFn: (row) => row.last_name,
        id: "Apellidos",
        header: "Apellidos",
    },
    {
        accessorFn: (row) => row.email,
        id: "email",
        header: "Email",
    },
    {
        accessorFn: (row) => formatDate(row.created_at ?? ""),
        id: "Fecha de creación",
        header: "Fecha de creación",
    },
    {
        id: "opciones",
        header: "Opciones",
        cell: ({ row }) => {
            const user = row.original;
            const { openEdit } = useUserStore();
            const { notify } = useToast();

            console.log("hola", user)
            const handleEdit = () => {
                openEdit({
                    name: user.name,
                    last_name: user.last_name ?? "",
                    email: user.email,
                    doc_number: user.doc_number ?? "",
                    is_active: user.is_active,
                    is_superadmin: user.is_superadmin,
                    password: "",
                    company_ids: user.users_companies.map((company) => company.company_id),
                    role_ids: user.user_roles.map((role) => role.role_id),
                }, user?.id);
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará el usario "${user.name}" de forma permanente.`,
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
                    await userService.delete(user.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La usuario fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Usuario eliminado correctamente", "success", 3000);

                    await fetchUsers();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar el usuario.",
                        icon: "error"
                    });

                    notify("Error al eliminar la usuario", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar usuario">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar usuario">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]