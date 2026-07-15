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
import { Customer } from "@/modules/sales/customers/types/customer.type"
import { customerService } from "@/modules/sales/customers/services/customer.service"
import { useCustomerStore } from "@/modules/sales/customers/store/customer.store"

interface ColumnsProps {
    fetchData: () => Promise<void>
}
export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Customer>[] => [

    /* {
        accessorKey: "name",
        header: "Nombre",
    }, */
    {
        accessorFn: (row) => row.full_name,
        id: "Nombres",
        header: "Nombres",
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
            const customer = row.original;
            const { openEdit } = useCustomerStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    full_name: customer.full_name,
                    email: customer.email,
                    doc_number: customer.doc_number ?? "",
                    doc_type: customer.doc_type,
                    phone: customer.phone,
                    address: customer.address,
                    credit_balance: customer.credit_balance,
                    credit_limit: customer.credit_limit,
                }, customer?.id);
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará el cliente "${customer.full_name}" de forma permanente.`,
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
                    await customerService.delete(customer.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La cliente fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Cliente eliminado correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar el cliente.",
                        icon: "error"
                    });

                    notify("Error al eliminar la cliente", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar cliente">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar cliente">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]