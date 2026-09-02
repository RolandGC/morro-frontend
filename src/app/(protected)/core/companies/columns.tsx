"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/hooks/dateFormat"
import { useToast } from "@/hooks/useToast"
import { Company } from "@/modules/core/companies/types/company.type"
import { useCompanyStore } from "@/modules/core/companies/store/company.store"
import { companyService } from "@/modules/core/companies/services/company.service"
import Swal from "sweetalert2"

interface ColumnsProps {
    fetchCompanies: () => Promise<void>;
}

export const getColumns = ({ fetchCompanies }: ColumnsProps): ColumnDef<Company>[] => [
    {
        accessorFn: (row) => row.name,
        id: "nombre",
        header: "Empresa",
    },
    {
        accessorFn: (row) => row.phone,
        id: "Telefono",
        header: "Teléfono",
    },
    {
        accessorFn: (row) => row.ruc,
        id: "ruc",
        header: "RUC",
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
            const company = row.original;
            const { openEdit } = useCompanyStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({
                    name: company.name,
                    ruc: company.ruc,
                    address: company?.address,
                    phone: company.phone,
                    trade_name: company.trade_name,
                    parent_company_id: company.parent_company_id,
                    warehouse_id: company.warehouse?.id
                }, company.id);
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará la empresa "${company.name}" de forma permanente.`,
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
                    await companyService.delete(company.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "La empresa fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Empresa eliminada correctamente", "success", 3000);

                    await fetchCompanies();

                } catch (error) {
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo eliminar la empresa.",
                        icon: "error"
                    });

                    notify("Error al eliminar la empresa", "error", 3000);
                    console.error(error);
                }
            };

            return (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} title="Editar Empresa">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} title="Eliminar Empresa">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        },
    }
]