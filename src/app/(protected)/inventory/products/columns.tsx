"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Product } from "@/modules/inventory/products/types/produc.type"
import { formatDate } from "@/hooks/dateFormat"
import { useProductStore } from "@/modules/inventory/products/store/product.store"
import { productService } from "@/modules/inventory/products/services/product.service"
import { useToast } from "@/hooks/useToast"
import { useProductUnitStore } from "@/modules/inventory/products/store/productUnit.store"
import Swal from "sweetalert2"

interface ColumnsProps {
    fetchData: () => Promise<void>;
}

export const getColumns = ({ fetchData }: ColumnsProps): ColumnDef<Product>[] => [
    {
        accessorKey: "name",
        header: "Producto",
    },
    {
        accessorFn: (row) => row.brands.name,
        id: "marca",
        header: "Marca",
    },
    {
        accessorFn: (row) => row.categories.name,
        id: "categoria",
        header: "Categoría",
    },
    {
        accessorFn: (row) => row.model,
        id: "modelo",
        header: "Modelo",
    },
    {
        accessorFn: (row) => formatDate(row.created_at),
        id: "Fecha de creación",
        header: "Fecha de creación",
    },
    {
        id: "actions",
        header: "Opciones",
        cell: ({ row }) => {
            const product = row.original;
            const { openEdit } = useProductStore();
            const { openList } = useProductUnitStore();
            const { notify } = useToast();

            const handleEdit = () => {
                openEdit({

                    name: product.name,
                    model: product.model,
                    unit_base: product.unit_base,
                    regime: product.regime,
                    has_igv: product.has_igv,
                    track_stock: product.track_stock,
                    category_id: product.category_id,
                    brand_id: product.brand_id,
                }, product.id);

            };

            const handleProductUnit = () => {
                openList(product.id)
            };

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: `Se eliminará el prodcuto "${product.name}" de forma permanente.`,
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
                    await productService.delete(product?.id);

                    await Swal.fire({
                        title: "¡Eliminado!",
                        text: "El producto fue eliminada correctamente.",
                        icon: "success",
                        confirmButtonText: "Aceptar"
                    });

                    notify("Producto eliminado correctamente", "success", 3000);

                    await fetchData();
                    notify("Producto eliminado correctamente", "success", 3000);
                    // Recargar la lista de productos
                    window.location.reload();
                } catch (error) {
                    notify("Error al eliminar el producto", "error", 3000);
                    console.error("Error deleting product:", error);
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
                    <Button variant="ghost" size="icon" onClick={handleProductUnit} title="Editar unidad producto">
                        <Tags className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    }
]