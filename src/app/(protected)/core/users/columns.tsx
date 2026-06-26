"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import { User } from "@/modules/core/user/types/user.types"
import { useUserStore } from "@/modules/core/user/store/user.store"
import { userService } from "@/modules/core/user/services/user.service"

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
    },
    {
        accessorFn: (row) => row.email,
        id: "email",
        header: "Email",
    },
    {
        accessorFn: (row) => row.last_name,
        id: "last_name",
        header: "Categoría",
    },
    {
        accessorFn: (row) => formatDate(row.created_at ?? ""),
        id: "created_at",
        header: "Fecha de creación",
    },
    {
        id: "actions",
        header: "Opciones",
        cell: ({ row }) => {
            const user = row.original;
            const { openEdit } = useUserStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: user.name,

                    last_name: user.last_name ?? "",
                    email: user.email,
                    doc_number: user.doc_number ?? "",
                    is_active: user.is_active,
                    is_superadmin: user.is_superadmin,
                    password: user.password_hash,
                    company_ids: user.users_companies,
                }, user?.id);

            };

            const handleDelete = async () => {
                if (!window.confirm(`¿Estás seguro de que quieres eliminar el usuario "${user.name}"?`)) {
                    return;
                }

                try {
                    const response = await userService.delete(user?.id ?? "");
                    console.log('Delete response:', response);
                    notify("Usuario eliminado correctamente", "success", 3000);
                    window.location.reload();
                } catch (error) {
                    notify("Error al eliminar el usuario", "error", 3000);
                    console.error("Error deleting user:", error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar producto">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar producto">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]