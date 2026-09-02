"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Package, ScanBarcode, Search, ShoppingCart,} from "lucide-react";
import { productService } from "@/modules/inventory/products/services/product.service";
import { Product } from "@/modules/inventory/products/types/produc.type";
import { ProductCard } from "@/modules/inventory/products/components/ProductCard";
import { ProductSearchItem } from "@/modules/inventory/products/components/ProductListSell";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

export default function SaleAddPage() {
    const router = useRouter();
    const { control, getValues, setValue, watch, trigger } = useFormContext<SaleForm>();
    const { success, error } = useToast();

    const { fields, append, remove } = useFieldArray<
        SaleForm,
        "items"
    >({
        control,
        name: "items",
    });

    const items = watch("items") ?? [];
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
        barcode: "",
        page: 1,
        limit: 7,
    });

    const fetchProducts = async () => {
        try {
            setProductLoading(true);

            const response = await productService.getAll(
                productFilter
            );

            if (response.status === 200) {
                const newProducts: Product[] =
                    response.data.data;

                setProductResults(newProducts);
                setProducts((prev) => {
                    const map = new Map(
                        prev.map((product) => [
                            product.id,
                            product,
                        ])
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
        } catch (err) {
            console.error(
                "Error fetching products:",
                err
            );
        } finally {
            setProductLoading(false);
        }
    };

    useEffect(() => {
        if (productFilter.barcode) {
            return;
        }

        const timeout = setTimeout(() => {
            fetchProducts().catch((err) =>
                console.error(err)
            );
        }, 300);

        return () => clearTimeout(timeout);
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

    const getAvailableStock = (product: Product) => {
        const stock = Number(
            product?.warehouse_stock?.[0]?.quantity ?? 0
        );

        const quantityInCart = items.reduce(
            (total, item) => {
                if (item.product_id !== product.id) {
                    return total;
                }

                return (
                    total +
                    Number(item.quantity ?? 0)
                );
            },
            0
        );

        return Math.max(
            0,
            stock - quantityInCart
        );
    };

    const handleSelectProduct = (
        product: Product
    ) => {
        const availableStock =
            getAvailableStock(product);

        if (availableStock <= 0) {
            error(
                `No hay stock disponible de ${product.name}`
            );
            return;
        }

        const currentItems =
            getValues("items") ?? [];

        const existingIndex =
            currentItems.findIndex(
                (item) =>
                    item.product_id === product.id
            );

        if (existingIndex !== -1) {
            const currentQuantity = Number(
                currentItems[existingIndex]
                    ?.quantity ?? 0
            );

            setValue(
                `items.${existingIndex}.quantity`,
                currentQuantity + 1,
                {
                    shouldValidate: true,
                    shouldDirty: true,
                }
            );

            success(
                `${product.name} agregado al carrito`
            );

            return;
        }

        setProducts((prev) => {
            if (
                prev.some(
                    (p) => p.id === product.id
                )
            ) {
                return prev;
            }

            return [...prev, product];
        });

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

        success(
            `${product.name} agregado al carrito`
        );
    };

    const handleIncrease = (index: number) => {
        const item = getValues(
            `items.${index}`
        );

        if (!item) return;

        const product = products.find(
            (p) => p.id === item.product_id
        );

        if (!product) return;

        const currentQuantity = Number(
            item.quantity || 0
        );

        const stock = Number(
            product.warehouse_stock?.[0]
                ?.quantity ?? 0
        );

        const quantityInCart = items.reduce(
            (total, currentItem, i) => {
                if (i === index) return total;

                if (
                    currentItem.product_id !==
                    product.id
                ) {
                    return total;
                }

                return (
                    total +
                    Number(
                        currentItem.quantity ?? 0
                    )
                );
            },
            0
        );

        const availableStock =
            stock -
            quantityInCart -
            currentQuantity;

        if (availableStock <= 0) {
            return;
        }

        setValue(
            `items.${index}.quantity`,
            currentQuantity + 1,
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );
    };

    const handleDecrease = (
        index: number
    ) => {
        const currentQuantity = Number(
            getValues(
                `items.${index}.quantity`
            ) || 0
        );

        if (currentQuantity <= 1) {
            return;
        }

        setValue(
            `items.${index}.quantity`,
            currentQuantity - 1,
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );
    };

    const subTotal = items.reduce(
        (acc, item) => {
            const quantity = Number(
                item.quantity ?? 0
            );

            const unitPrice = Number(
                item.unit_price ?? 0
            );

            return (
                acc + quantity * unitPrice
            );
        },
        0
    );

    const handleBarcodeSearch =
        async () => {
            const barcode =
                productFilter.barcode.trim();

            if (!barcode) return;

            try {
                setProductLoading(true);

                const response =
                    await productService.getAll({
                        ...productFilter,
                        barcode,
                        name: "",
                        page: 1,
                        limit: 1,
                    });

                if (
                    response.status !== 200 ||
                    !response.data?.data ||
                    response.data.data.length === 0
                ) {
                    error(
                        `No se encontró ningún producto con el código ${barcode}`
                    );
                    return;
                }

                const product: Product =
                    response.data.data[0];

                setProducts((prev) => {
                    const map = new Map(
                        prev.map((product) => [
                            product.id,
                            product,
                        ])
                    );

                    map.set(
                        product.id,
                        product
                    );

                    return Array.from(
                        map.values()
                    );
                });

                const availableStock =
                    getAvailableStock(
                        product
                    );

                if (availableStock <= 0) {
                    error(
                        `No hay stock disponible de ${product.name}`
                    );
                    return;
                }

                const currentItems =
                    getValues("items") ?? [];

                const existingIndex =
                    currentItems.findIndex(
                        (item) =>
                            item.product_id ===
                            product.id
                    );

                if (
                    existingIndex !== -1
                ) {
                    const currentQuantity =
                        Number(
                            currentItems[
                                existingIndex
                            ]?.quantity ?? 0
                        );

                    setValue(
                        `items.${existingIndex}.quantity`,
                        currentQuantity + 1,
                        {
                            shouldValidate:
                                true,
                            shouldDirty: true,
                        }
                    );
                } else {
                    append({
                        product_id:
                            product.id,
                        product_unit_id: "",
                        quantity: 1,
                        unit_quantity: 1,
                        unit_price:
                            product.unit_price ??
                            0,
                        igv_amount: 0,
                        subtotal: 0,
                        is_bonus: false,
                    });
                }

                success(
                    `${product.name} agregado al carrito`
                );
            } catch (err) {
                console.error(
                    "Error buscando producto por código de barras:",
                    err
                );

                error(
                    "Ocurrió un error al buscar el producto"
                );
            } finally {
                setProductLoading(false);

                setProductFilter(
                    (prev) => ({
                        ...prev,
                        barcode: "",
                    })
                );
            }
        };

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">
                    Productos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Busca productos y agrégalos al
                    carrito para continuar con la venta.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Package size={18} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Catálogo de productos
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Busca y selecciona los productos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <ScanBarcode
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            type="text"
                            placeholder="Escanear código de barras..."
                            className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                            value={
                                productFilter.barcode
                            }
                            onChange={(e) =>
                                setProductFilter(
                                    (prev) => ({
                                        ...prev,
                                        barcode:
                                            e.target
                                                .value,
                                    })
                                )
                            }
                            onKeyDown={(e) => {
                                if (
                                    e.key ===
                                    "Enter"
                                ) {
                                    e.preventDefault();
                                    handleBarcodeSearch();
                                }
                            }}
                        />
                    </div>

                    <div className="relative mt-3">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="text"
                            value={
                                searchProduct
                            }
                            onChange={(e) =>
                                setSearchProduct(
                                    e.target.value
                                )
                            }
                            placeholder="Buscar producto..."
                            className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* LISTA */}
                    <div className="mt-4 max-h-130 space-y-2 overflow-y-auto pr-1">
                        {productLoading ? (
                            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Search
                                        size={22}
                                        className="text-primary"
                                    />
                                </div>

                                <h4 className="font-medium">
                                    Buscando productos
                                </h4>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Espera un momento...
                                </p>
                            </div>
                        ) : productResults.length ===
                            0 ? (
                            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Package
                                        size={22}
                                        className="text-primary"
                                    />
                                </div>

                                <h4 className="font-medium">
                                    No hay productos
                                </h4>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Intenta realizar otra búsqueda.
                                </p>
                            </div>
                        ) : (
                            productResults.map(
                                (product) => (
                                    <ProductSearchItem
                                        key={
                                            product.id
                                        }
                                        product={
                                            product
                                        }
                                        onSelect={
                                            handleSelectProduct
                                        }
                                        availableStock={getAvailableStock(
                                            product
                                        )}
                                    />
                                )
                            )
                        )}
                    </div>
                </div>

                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <ShoppingCart
                                size={18}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">
                                Carrito
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Productos seleccionados para esta venta.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {items.length === 0 ? (
                            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                    <ShoppingCart
                                        size={26}
                                        className="text-primary"
                                    />
                                </div>

                                <h4 className="font-medium">
                                    No hay productos en el carrito
                                </h4>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Busca un producto y agrégalo para comenzar la venta.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {items.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const product =
                                                products.find(
                                                    (
                                                        p
                                                    ) =>
                                                        p.id ===
                                                        item?.product_id
                                                );

                                            if (
                                                !product
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={
                                                        fields[
                                                            index
                                                        ]
                                                            ?.id
                                                    }
                                                    className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                                                >
                                                    <ProductCard
                                                        product={
                                                            product
                                                        }
                                                        onIncrease={() =>
                                                            handleIncrease(
                                                                index
                                                            )
                                                        }
                                                        onDecrease={() =>
                                                            handleDecrease(
                                                                index
                                                            )
                                                        }
                                                        onRemove={() =>
                                                            remove(
                                                                index
                                                            )
                                                        }
                                                        quantity={Number(
                                                            items[
                                                                index
                                                            ]
                                                                ?.quantity ??
                                                            0
                                                        )}
                                                        onChangeQuantity={(
                                                            q
                                                        ) =>
                                                            setValue(
                                                                `items.${index}.quantity`,
                                                                q,
                                                                {
                                                                    shouldValidate:
                                                                        true,
                                                                    shouldDirty:
                                                                        true,
                                                                }
                                                            )
                                                        }
                                                        units={
                                                            product.product_units
                                                        }
                                                        selectedUnitId={
                                                            items[
                                                                index
                                                            ]
                                                                ?.product_unit_id
                                                        }
                                                        onSelectUnit={(
                                                            unitId
                                                        ) =>
                                                            setValue(
                                                                `items.${index}.product_unit_id`,
                                                                unitId,
                                                                {
                                                                    shouldValidate:
                                                                        true,
                                                                    shouldDirty:
                                                                        true,
                                                                }
                                                            )
                                                        }
                                                        unitPrice={Number(
                                                            items[
                                                                index
                                                            ]
                                                                ?.unit_price ??
                                                            product.unit_price
                                                        )}
                                                        onChangeUnitPrice={(
                                                            price
                                                        ) =>
                                                            setValue(
                                                                `items.${index}.unit_price`,
                                                                price,
                                                                {
                                                                    shouldValidate:
                                                                        true,
                                                                    shouldDirty:
                                                                        true,
                                                                }
                                                            )
                                                        }
                                                    />
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                <div className="rounded-2xl border bg-primary/5 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Resumen de venta
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {
                                                    items.length
                                                }{" "}
                                                {items.length ===
                                                    1
                                                    ? "producto"
                                                    : "productos"}{" "}
                                                en el carrito
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">
                                                Total
                                            </p>

                                            <p className="text-xl font-semibold text-primary">
                                                S/{" "}
                                                {subTotal.toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Subtotal
                                            </span>

                                            <span className="font-medium">
                                                S/{" "}
                                                {subTotal.toFixed(
                                                    2
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-medium">
                                                TOTAL
                                            </span>

                                            <span className="text-lg font-semibold">
                                                S/{" "}
                                                {subTotal.toFixed(
                                                    2
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() =>
                        router.push(
                            "/sales/sale"
                        )
                    }
                >
                    Cancelar
                </Button>

                <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={async () => {
                        const valid =
                            await trigger?.(
                                "items"
                            );

                        if (valid) {
                            router.push(
                                "/sales/sale/add/customer"
                            );
                        }
                    }}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
