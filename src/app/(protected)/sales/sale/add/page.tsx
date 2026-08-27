"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useFieldArray } from "react-hook-form";
import { productService } from "@/modules/inventory/products/services/product.service";
import { Product } from "@/modules/inventory/products/types/produc.type";
import { Package, ScanBarcode, Search, ShoppingCart } from "lucide-react";
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
        limit: 7,
        //order: "asc",
    });

    const fetchProducts = async () => {
        try {
            setProductLoading(true);
            const response = await productService.getAll(productFilter);
            if (response.status === 200) {
                const newProducts: Product[] = response.data.data;

                setProductResults(newProducts);
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

    const subTotal = items?.reduce((acc, item) => {
        const quantity = Number(item.quantity ?? 0);
        const unitPrice = Number(item.unit_price ?? 0);

        return acc + quantity * unitPrice;
    }, 0) ?? 0;

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex">
                <Package size={24} />
                <h2 className="text-lg font-medium mb-4 ml-2">Productos</h2>
            </div>
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
                            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
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
                            className="w-full pl-10 pr-3 py-2 border rounded-md"
                        />
                    </div>
                    <div className="mt-3 space-y-2 max-h-125 overflow-y-auto pr-1">
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
                    <div className="flex">
                        <ShoppingCart size={24} />
                        <h2 className="ml-2">Carrito</h2>
                    </div>
                    <div className="mt-4 space-y-3">
                        {!items || items.length === 0 ? (
                            <div className="flex min-h-87.5 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                    <ShoppingCart
                                        size={28}
                                        strokeWidth={1.5}
                                        className="text-gray-400"
                                    />
                                </div>

                                <h3 className="text-base font-medium text-gray-700">
                                    No hay productos en el carrito
                                </h3>

                                <p className="mt-1 text-sm text-gray-400">
                                    Busca y agrega productos para continuar
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => {
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
                                            quantity={Number(
                                                items[index]?.quantity ?? 0
                                            )}
                                            onChangeQuantity={(q) =>
                                                setValue(
                                                    `items.${index}.quantity`,
                                                    q,
                                                    {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    }
                                                )
                                            }
                                            units={product.product_units}
                                            selectedUnitId={
                                                items[index]?.product_unit_id
                                            }
                                            onSelectUnit={(unitId) =>
                                                setValue(
                                                    `items.${index}.product_unit_id`,
                                                    unitId,
                                                    {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    }
                                                )
                                            }
                                            unitPrice={Number(
                                                items[index]?.unit_price ??
                                                product.unit_price
                                            )}
                                            onChangeUnitPrice={(price) =>
                                                setValue(
                                                    `items.${index}.unit_price`,
                                                    price,
                                                    {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    }
                                                )
                                            }
                                        />
                                    );
                                })}

                                <div className="w-full rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Subtotal:
                                        </span>

                                        <span className="font-medium">
                                            S/ {subTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                            TOTAL:
                                        </span>

                                        <span className="font-semibold">
                                            S/ {subTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <div className="mt-6 flex justify-center gap-2">
                {/* <button
                    type="button"
                    className="rounded-md border px-3 py-1 text-sm text-muted-foreground cursor-not-allowed"
                    disabled
                >
                    Anterior
                </button> */}

                <button
                    type="button"
                    className="rounded-md bg-primary px-5 py-2 text-sm text-white"
                    onClick={async () => {
                        const valid = await trigger?.("items");
                        if (valid) {
                            router.push("/sales/sale/add/customer");
                        }
                    }}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
