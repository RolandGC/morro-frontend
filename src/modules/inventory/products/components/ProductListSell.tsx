import React from "react";
import { Package } from "lucide-react";
import { Product } from "@/modules/inventory/products/types/produc.type";

interface ProductSearchItemProps {
    product: Product;
    onSelect: (product: Product) => void;
}

export function ProductSearchItem({
    product,
    onSelect,
}: ProductSearchItemProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(product)}
            className="w-full text-left"
        >
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 transition hover:bg-gray-50">

                {/* Icono */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <Package
                        size={20}
                        className="text-orange-500"
                    />
                </div>

                {/* Información */}
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-800">
                        {product.name}
                    </div>

                    <div className="mt-0.5 text-xs text-gray-400">
                        Stock: {product.stock ?? 0} unid
                    </div>
                </div>

                {/* Precio */}
                <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-gray-800">
                        PEN {Number(product.price ?? 0).toFixed(2)}
                    </div>

                    <div className="text-xs text-gray-400">
                        General
                    </div>
                </div>

            </div>
        </button>
    );
}