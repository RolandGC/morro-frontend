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


export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Producto",
    },
    {
        accessorFn: (row) => row.brands.name,
        id: "brand",
        header: "Marca",
    },
    {
        accessorFn: (row) => row.categories.name,
        id: "category",
        header: "Categoría",
    },
    {
        accessorFn: (row) => row.model,
        id: "model",
        header: "Modelo",
    },
    {
        accessorFn: (row) => formatDate(row.created_at),
        id: "created_at",
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
                if (!window.confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) {
                    return;
                }

                try {
                    const response = await productService.delete(product?.id);
                    console.log('Delete response:', response);
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