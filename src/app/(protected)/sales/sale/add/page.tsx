"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useFieldArray } from "react-hook-form";
import { productService } from "@/modules/inventory/products/services/product.service";
import { Product } from "@/modules/inventory/products/types/produc.type";
import { ScanBarcode, Search } from "lucide-react";
import { ProductCard } from "@/modules/inventory/products/components/ProductCard";
import { ProductSearchItem } from "@/modules/inventory/products/components/ProductListSell";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";

export default function SaleAddPage() {
    const { control, getValues, setValue, watch, trigger } = useFormContext<SaleForm>();
    const router = useRouter();

    const { fields, append, remove } = useFieldArray<SaleForm, "items">({
        control,
        name: "items",
    });

    const items = watch("items");

    const [products, setProducts] = useState<Product[]>([]);

    const [searchProduct, setSearchProduct] = useState("");
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);

    const [productFilter, setProductFilter] = useState({
        name: "",
        brand_id: undefined,
        category_id: undefined,
        regime: undefined,
        has_igv: undefined,
        is_active: true,
        model: "",
        track_stock: undefined,
        page: 1,
        limit: 6,
        //order: "asc",
    });

    const fetchProducts = async () => {
        try {
            setProductLoading(true);

            const response = await productService.getAll(productFilter);

            if (response.status === 200) {
                const newProducts: Product[] = response.data.data;

                setProductResults(newProducts);

                // Guardamos los productos encontrados en cache
                setProducts((prev) => {
                    const map = new Map(
                        prev.map((product) => [product.id, product])
                    );

                    newProducts.forEach((product) => {
                        map.set(product.id, product);
                    });

                    return Array.from(map.values());
                });
            } else {
                console.error(
                    "Error fetching products:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setProductLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts().catch((e) => console.error(e));
    }, [productFilter]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setProductFilter((prev) => ({
                ...prev,
                name: searchProduct,
                page: 1,
            }));
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchProduct]);

    const handleSelectProduct = async (product: Product) => {
        append({
            product_id: product.id,
            product_unit_id: "",
            quantity: 1,
            unit_quantity: 1,
            unit_price: product.unit_price ?? 0,
            igv_amount: 0,
            subtotal: 0,
            is_bonus: false,
        });
    };

    const handleIncrease = (index: number) => {
        const currentQuantity = Number(
            getValues(`items.${index}.quantity`) || 0
        );

        setValue(
            `items.${index}.quantity`,
            currentQuantity + 1,
            { shouldValidate: true, shouldDirty: true }
        );
    };

    const handleDecrease = (index: number) => {
        const currentQuantity = Number(
            getValues(`items.${index}.quantity`) || 0
        );

        if (currentQuantity <= 1) return;

        setValue(
            `items.${index}.quantity`,
            currentQuantity - 1,
            { shouldValidate: true, shouldDirty: true }
        );
    };

    return (
        <div className="container mx-auto py-4 px-4">
            <h2 className="text-lg font-medium mb-4">Productos</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <ScanBarcode
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Escanear código de barras (presione Enter)..."
                            className="w-full pl-10 pr-3 py-2 border rounded-md pl-10"
                        />
                    </div>

                    <div className="relative mt-3">
                        <Search
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchProduct}
                            onChange={(e) => setSearchProduct(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full pl-10 pr-3 py-2 border rounded-md pl-10"
                        />
                    </div>
                    <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {productLoading ? (
                            <div className="py-8 text-center text-sm text-gray-400">
                                Buscando productos...
                            </div>
                        ) : productResults.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400">
                                No se encontraron productos
                            </div>
                        ) : (
                            productResults.map((product) => (
                                <ProductSearchItem
                                    key={product.id}
                                    product={product}
                                    onSelect={handleSelectProduct}
                                />
                            ))
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="mt-4 space-y-3">
                        {items?.map((item, index) => {
                            const product = products.find(
                                (p) => p.id === item?.product_id
                            );

                            if (!product) return null;

                            return (
                                <ProductCard
                                    key={fields[index]?.id}
                                    product={product}
                                    onIncrease={() => handleIncrease(index)}
                                    onDecrease={() => handleDecrease(index)}
                                    onRemove={() => remove(index)}
                                    quantity={Number(items?.[index]?.quantity ?? 0)}
                                    onChangeQuantity={(q) =>
                                        setValue(`items.${index}.quantity`, q, { shouldValidate: true, shouldDirty: true })
                                    }
                                    units={product.product_units}
                                    selectedUnitId={items?.[index]?.product_unit_id}
                                    onSelectUnit={(unitId) => setValue(`items.${index}.product_unit_id`, unitId, { shouldValidate: true, shouldDirty: true })}
                                    unitPrice={Number(items?.[index]?.unit_price ?? product.unit_price)}
                                />
                            );
                        })}
                    </div>

                </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <button
                    type="button"
                    className="rounded-md border px-3 py-1 text-sm text-muted-foreground cursor-not-allowed"
                    disabled
                >
                    Anterior
                </button>

                <button
                    type="button"
                    className="rounded-md bg-primary px-3 py-1 text-sm text-white"
                    onClick={async () => {
                        const valid = await trigger?.("items");
                        if (valid) {
                            router.push("/sales/sale/add/cliente");
                        }
                    }}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
