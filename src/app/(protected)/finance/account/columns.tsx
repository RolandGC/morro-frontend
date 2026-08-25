"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import Swal from "sweetalert2"
import { Account } from "@/modules/finances/Account/types/account.types"
import { translateAccountType } from "@/modules/finances/Account/utils"
import { useAccountStore } from "@/modules/finances/Account/store/account.store"
import { accountService } from "@/modules/finances/Account/services/account.service"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Account>[] => [
    {
        accessorFn: (row) => row.name,
        id: "nombre",
        header: "Nombre",
    },
    
    {
        accessorFn: (row) => translateAccountType(row.type),
        id: "tipo",
        header: "Tipo",
    },
    {
        accessorFn: (row) => row.bank_name,
        id: "Banco",
        header: "Banco",
    },
   
    {
        id: "Opciones",
        header: "Opciones",
        cell: ({ row }) => {
            const account = row.original;
            const { openEdit } = useAccountStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: account.name,
                    company_id: account.company_id,
                    account_number: account.account_number,
                    bank_name: account.bank_name ,
                    type: account.type,
                    currency_id: account.currency_id,
                    is_active: account.is_active ?? true
                }, account.id);
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará la account "${account.name}" de forma permanente.`,
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
                    await accountService.delete(account.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La cuenta fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Cuenta eliminada correctamente", "success", 3000);

                    await fetchData();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar la cuenta.",
                        icon: "error"
                    });

                    notify("Error al eliminar la cuenta", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar Cuenta">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar Cuenta">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]