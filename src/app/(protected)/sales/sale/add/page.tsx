"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Package, ScanBarcode, Search, ShoppingCart, Undo2, UserRound } from "lucide-react";
import { productService } from "@/modules/inventory/products/services/product.service";
import { Product } from "@/modules/inventory/products/types/produc.type";
import { ProductCard } from "@/modules/inventory/products/components/ProductCard";
import { ProductSearchItem } from "@/modules/inventory/products/components/ProductListSell";
import { SaleForm } from "@/modules/sales/sale/validators/saleSchema";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import CustomerFormModal from "@/modules/sales/customers/components/CustomerFormModal";
import { CustomerSearchItem } from "@/modules/sales/customers/components/CustomerSearchItem";
import { Customer } from "@/modules/sales/customers/types/customer.type";
import { useCustomerStore } from "@/modules/sales/customers/store/customer.store";
import { customerService } from "@/modules/sales/customers/services/customer.service";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { useSaleStore } from "@/modules/sales/sale/store/sale.store";
import { useCustomerDisplayStore } from "@/modules/sales/sale/store/customerDisplay.store";
import {
    openCustomerDisplay,
    publishClear,
} from "@/modules/sales/sale/services/customerDisplay.service";

export default function SaleAddPage() {
    const router = useRouter();
    const { control, getValues, setValue, watch, trigger, formState: { errors }, } = useFormContext<SaleForm>();
    const { success, error } = useToast();

    const { fields, append, remove, insert } = useFieldArray<SaleForm, "items">({
        control,
        name: "items",
    });

    const items = watch("items") ?? [];
    const itemsError =
        errors.items?.message ??
        errors.items?.root?.message;
    const [products, setProducts] = useState<Product[]>([]);
    const [searchProduct, setSearchProduct] = useState("");
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);

    const { openCreate } = useCustomerStore()
    const [searchCustomer, setSearchCustomer] = useState("");
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);

    const [productFilter, setProductFilter] = useState({
        name: "",
        model: "",
        track_stock: undefined,
        barcode: "",
        is_active: true,
        page: 1,
        limit: 6,
    });

    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const [justAddedKey, setJustAddedKey] = useState<string | null>(null);
    const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flashItem = (key: string) => {
        setJustAddedKey(key);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setJustAddedKey(null), 900);
    };

    useEffect(() => {
        return () => {
            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        };
    }, []);

    const [lastRemoved, setLastRemoved] = useState<{ item: any; index: number } | null>(null);
    const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        };
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const getProductUnit = (product: Product, unitId?: string) => {
        return product.product_units?.find((unit) => unit.id === unitId);
    };

    const getDefaultUnit = (product: Product) => {
        return (
            product.product_units?.find((unit) => unit.is_default) ??
            product.product_units?.[0]
        );
    };

    const getUnitConversionFactor = (product: Product, unitId?: string) => {
        const unit = getProductUnit(product, unitId);
        return Number(unit?.conversion_factor ?? 1);
    };


    useEffect(() => {
        console.log("changeee", watch("items"));

    }, [items]);

    useEffect(() => {
        const missingProductIds = items
            .map((item) => item.product_id)
            .filter(
                (id): id is string =>
                    !!id && !products.some((p) => p.id === id)
            );

        if (missingProductIds.length === 0) return;

        const uniqueIds = Array.from(new Set(missingProductIds));

        const fetchMissingProducts = async () => {
            try {
                const response = await productService.getAll({
                    is_active: true,
                    page: 1,
                    limit: 100,
                });

                const allProducts: Product[] = response.data?.data ?? [];
                const fetched = allProducts.filter((p) =>
                    uniqueIds.includes(p.id)
                );

                if (fetched.length > 0) {
                    setProducts((prev) => {
                        const map = new Map(prev.map((p) => [p.id, p]));
                        fetched.forEach((p) => map.set(p.id, p));
                        return Array.from(map.values());
                    });
                }
            } catch (err) {
                console.error("Error cargando productos del draft:", err);
            }
        };

        fetchMissingProducts();
    }, [items, products]);

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
                /* setProducts((prev) => {
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
                }); */
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
        if (productFilter.barcode) return;

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
        const stock = Number(product?.warehouse_stock?.[0]?.quantity ?? 0);

        const quantityInCart = items.reduce((total, item) => {
            if (item.product_id !== product.id) return total;

            const conversionFactor = getUnitConversionFactor(
                product,
                item.product_unit_id
            );

            const quantity = Number(item.quantity ?? 0);

            return total + quantity * conversionFactor;
        }, 0);

        return Math.max(0, stock - quantityInCart);
    };

    const getRemainingBaseStockForIndex = (index: number) => {
        const item = items[index];
        const product = products.find((p) => p.id === item?.product_id);

        if (!item || !product) return 0;

        const conversionFactor = getUnitConversionFactor(
            product,
            item.product_unit_id
        );

        const stock = Number(product.warehouse_stock?.[0]?.quantity ?? 0);

        const quantityInOtherItems = items.reduce(
            (total, currentItem, currentIndex) => {
                if (
                    currentIndex === index ||
                    currentItem.product_id !== product.id
                ) {
                    return total;
                }

                const factor = getUnitConversionFactor(
                    product,
                    currentItem.product_unit_id
                );

                return (
                    total +
                    Number(currentItem.quantity ?? 0) * factor
                );
            },
            0
        );

        const currentQuantityInBase =
            Number(item.quantity ?? 0) * conversionFactor;

        return stock - quantityInOtherItems - currentQuantityInBase;
    };

    const canIncreaseIndex = (index: number) => {
        const item = items[index];
        const product = products.find((p) => p.id === item?.product_id);

        if (!item || !product) return false;

        const conversionFactor = getUnitConversionFactor(
            product,
            item.product_unit_id
        );

        return getRemainingBaseStockForIndex(index) >= conversionFactor;
    };

    const handleSelectProduct = (product: Product) => {
        const defaultUnit = getDefaultUnit(product);

        if (!defaultUnit) {
            error(`El producto ${product.name} no tiene unidades configuradas`);
            return;
        }

        useCustomerDisplayStore.getState().cacheProduct(product);

        const currentItems = getValues("items") ?? [];

        const existingIndex = currentItems.findIndex(
            (item) =>
                item.product_id === product.id &&
                item.product_unit_id === defaultUnit.id
        );

        const availableStock = getAvailableStock(product);
        const conversionFactor = Number(defaultUnit.conversion_factor ?? 1);

        if (availableStock < conversionFactor) {
            error(`No hay stock suficiente de ${product.name}`);
            return;
        }

        if (existingIndex !== -1) {
            const currentQuantity = Number(
                currentItems[existingIndex]?.quantity ?? 0
            );

            setValue(
                `items.${existingIndex}.quantity`,
                currentQuantity + 1,
                {
                    shouldValidate: true,
                    shouldDirty: true,
                }
            );

            flashItem(`${product.id}-${defaultUnit.id}`);
            success(`${product.name} agregado al carrito`);
            return;
        }

        setProducts((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            return [...prev, product];
        });

        append({
            product_id: product.id,
            product_unit_id: defaultUnit.id,
            quantity: 1,
            unit_quantity: conversionFactor,
            unit_price: product.unit_price ?? 0,
            igv_amount: 0,
            subtotal: 0,
            is_bonus: false,
        });

        flashItem(`${product.id}-${defaultUnit.id}`);
        success(`${product.name} agregado al carrito`);
    };

    const handleIncrease = (index: number) => {
        const item = getValues(`items.${index}`);
        if (!item) return;

        const product = products.find(
            (product) => product.id === item.product_id
        );

        if (!product) return;

        const currentQuantity = Number(item.quantity ?? 0);
        const conversionFactor = getUnitConversionFactor(
            product,
            item.product_unit_id
        );

        if (!canIncreaseIndex(index)) {
            error(`No hay más stock disponible de ${product.name}`);
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


    const handleDecrease = (index: number) => {
        const currentQuantity = Number(getValues(`items.${index}.quantity`) || 0);
        if (currentQuantity <= 1) return;

        setValue(`items.${index}.quantity`, currentQuantity - 1, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    // --- Mejora 5: eliminar con posibilidad de deshacer ---
    const handleRemoveItem = (index: number) => {
        const item = getValues(`items.${index}`);
        remove(index);

        setLastRemoved({ item, index });

        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = setTimeout(() => setLastRemoved(null), 5000);
    };

    const handleUndoRemove = () => {
        if (!lastRemoved) return;

        insert(lastRemoved.index, lastRemoved.item);
        setLastRemoved(null);

        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };

    const subTotal = items.reduce((acc, item) => {
        const quantity = Number(item.quantity ?? 0);
        const unitPrice = Number(item.unit_price ?? 0);

        return acc + quantity * unitPrice;
    }, 0);

    const productsMap = new Map(
        products.map((product) => [product.id, product])
    );

    const regimeCounts = items.reduce(
        (acc, item) => {
            const product = productsMap.get(item.product_id);

            if (product?.regime === "zofra") {
                acc.zofra += 1;
            }

            if (product?.regime === "general") {
                acc.general += 1;
            }

            return acc;
        },
        {
            zofra: 0,
            general: 0,
        }
    );


    const handleBarcodeSearch = async () => {
        const barcode = productFilter.barcode.trim();
        if (!barcode) return;

        try {
            setProductLoading(true);

            const response = await productService.getAll({
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
                error(`No se encontró ningún producto con el código ${barcode}`);
                return;
            }

            const product: Product = response.data.data[0];

            const selectedUnit = product.product_units?.find(
                (unit) => unit.barcode === barcode
            );

            if (!selectedUnit) {
                error(
                    `No se encontró la unidad asociada al código ${barcode}`
                );
                return;
            }

            const conversionFactor = Number(
                selectedUnit.conversion_factor ?? 1
            );

            const currentItems = getValues("items") ?? [];

            const quantityInCart = currentItems.reduce((total, item) => {
                if (item.product_id !== product.id) return total;

                const unit = product.product_units?.find(
                    (productUnit) =>
                        productUnit.id === item.product_unit_id
                );

                const factor = Number(unit?.conversion_factor ?? 1);
                const quantity = Number(item.quantity ?? 0);

                return total + quantity * factor;
            }, 0);

            const stock = Number(
                product.warehouse_stock?.[0]?.quantity ?? 0
            );

            const availableStock = stock - quantityInCart;

            if (availableStock < conversionFactor) {
                error(
                    `No hay stock suficiente de ${product.name} para vender ${selectedUnit.name}`
                );
                return;
            }

            useCustomerDisplayStore.getState().cacheProduct(product);

            setProducts((prev) => {
                if (prev.some((p) => p.id === product.id)) {
                    return prev;
                }

                return [...prev, product];
            });

            const existingIndex = currentItems.findIndex(
                (item) =>
                    item.product_id === product.id &&
                    item.product_unit_id === selectedUnit.id
            );

            if (existingIndex !== -1) {
                const currentQuantity = Number(
                    currentItems[existingIndex]?.quantity ?? 0
                );

                setValue(
                    `items.${existingIndex}.quantity`,
                    currentQuantity + 1,
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );
            } else {
                append({
                    product_id: product.id,
                    product_unit_id: selectedUnit.id,
                    quantity: 1,
                    unit_quantity: conversionFactor,
                    unit_price: product.unit_price ?? 0,
                    igv_amount: 0,
                    subtotal: 0,
                    is_bonus: false,
                });
            }

            flashItem(`${product.id}-${selectedUnit.id}`);

            success(
                `${product.name} - ${selectedUnit.name} agregado al carrito`
            );
        } catch (err) {
            console.error(
                "Error buscando producto por código de barras:",
                err
            );

            error("Ocurrió un error al buscar el producto");
        } finally {
            setProductLoading(false);

            setProductFilter((prev) => ({
                ...prev,
                barcode: "",
            }));

            requestAnimationFrame(() => {
                barcodeInputRef.current?.focus();
            });
        }
    };

    const fetchCustomers = async (full_name = "") => {
        try {
            setCustomerLoading(true);

            const response = await customerService.getAll({
                full_name,
                is_active: true,
                page: 1,
                limit: 6,
            });

            if (response.status === 200) {
                setCustomerResults(response.data.data);
            } else {
                setCustomerResults([]);
            }
        } catch (error) {
            console.error("Error obteniendo clientes:", error);
            setCustomerResults([]);
        } finally {
            setCustomerLoading(false);
        }
    };

    useEffect(() => {
        const value = searchCustomer.trim();

        const timeout = setTimeout(() => {
            fetchCustomers(value);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchCustomer]);

    return (
        <div className="container mx-auto max-w-7xl px-4 py-3">
            <div className="mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Nueva venta
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Agrega productos, selecciona el cliente y continúa con el pago.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="border-b px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Package size={18} />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Productos
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Busca o escanea un producto.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Código de barras
                                </label>

                                <div className="relative">
                                    <ScanBarcode
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    />

                                    <input
                                        ref={barcodeInputRef}
                                        type="text"
                                        placeholder="Escanear código..."
                                        className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        value={productFilter.barcode}
                                        onChange={(e) =>
                                            setProductFilter((prev) => ({
                                                ...prev,
                                                barcode: e.target.value,
                                            }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleBarcodeSearch();
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-xs text-muted-foreground">
                                    o busca por nombre
                                </span>
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />

                                <input
                                    type="text"
                                    value={searchProduct}
                                    onChange={(e) =>
                                        setSearchProduct(e.target.value)
                                    }
                                    placeholder="Buscar producto..."
                                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    Resultados
                                </p>

                                {productResults.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        {productResults.length} encontrados
                                    </span>
                                )}
                            </div>

                            <div className="max-h-150 space-y-2 overflow-y-auto pr-1">
                                {productLoading ? (
                                    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Search
                                                size={20}
                                                className="text-primary"
                                            />
                                        </div>

                                        <p className="font-medium">
                                            Buscando productos
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Espera un momento...
                                        </p>
                                    </div>
                                ) : productResults.length === 0 ? (
                                    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
                                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Package
                                                size={20}
                                                className="text-primary"
                                            />
                                        </div>

                                        <p className="font-medium">
                                            No hay productos
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Intenta con otro término de búsqueda.
                                        </p>
                                    </div>
                                ) : (
                                    productResults.map((product) => (
                                        <ProductSearchItem
                                            key={product.id}
                                            product={product}
                                            onSelect={handleSelectProduct}
                                            availableStock={getAvailableStock(product)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex min-h-0 flex-col rounded-2xl border bg-card shadow-sm">
                    <div className="border-b px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <ShoppingCart size={18} />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Carrito
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Productos de esta venta.
                                    </p>
                                </div>
                            </div>

                            {items.length > 0 && (
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                                    {items.length}{" "}
                                    {items.length === 1
                                        ? "producto"
                                        : "productos"}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                        {items.length === 0 ? (
                            <div className="flex min-h-105 flex-1 items-center justify-center">
                                <div className="max-w-sm text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                        <ShoppingCart
                                            size={26}
                                            className="text-muted-foreground"
                                        />
                                    </div>

                                    <h3 className="font-medium">
                                        Tu carrito está vacío
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Selecciona un producto del catálogo
                                        para agregarlo a la venta.
                                    </p>
                                    {errors.items?.message && (
                                        <p className="mb-3 text-sm font-medium text-destructive">
                                            {errors.items.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {items.map((item, index) => {
                                        const product = products.find((p) => p.id === item.product_id);
                                        if (!product) return null;

                                        const isJustAdded =
                                            `${item.product_id}-${item.product_unit_id}` === justAddedKey;

                                        return (
                                            <div
                                                key={fields[index]?.id}
                                                className={`overflow-hidden rounded-xl border bg-background transition-all duration-300 ${isJustAdded
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : ""
                                                    }`}
                                            >
                                                <ProductCard
                                                    product={product}
                                                    quantity={Number(item.quantity ?? 0)}
                                                    units={product.product_units}
                                                    selectedUnitId={item.product_unit_id}
                                                    unitPrice={Number(
                                                        item.unit_price ?? product.unit_price
                                                    )}
                                                    availableStock={getAvailableStock(product)}
                                                    onIncrease={() => handleIncrease(index)}
                                                    onDecrease={() => handleDecrease(index)}
                                                    onRemove={() => handleRemoveItem(index)}
                                                    onChangeQuantity={(q) =>
                                                        setValue(`items.${index}.quantity`, q, {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                        })
                                                    }
                                                    onSelectUnit={(unitId) => {
                                                        const unit = product.product_units?.find(
                                                            (unit) => unit.id === unitId
                                                        );

                                                        if (!unit) return;

                                                        const conversionFactor = Number(
                                                            unit.conversion_factor ?? 1
                                                        );
                                                        const currentQuantity = Number(item.quantity ?? 0);
                                                        const stock = Number(
                                                            product.warehouse_stock?.[0]?.quantity ?? 0
                                                        );

                                                        const quantityInOtherItems = items.reduce(
                                                            (total, currentItem, currentIndex) => {
                                                                if (
                                                                    currentIndex === index ||
                                                                    currentItem.product_id !== product.id
                                                                ) {
                                                                    return total;
                                                                }

                                                                const factor =
                                                                    getUnitConversionFactor(
                                                                        product,
                                                                        currentItem.product_unit_id
                                                                    );

                                                                return (
                                                                    total +
                                                                    Number(currentItem.quantity ?? 0) *
                                                                    factor
                                                                );
                                                            },
                                                            0
                                                        );

                                                        const newQuantityInBase =
                                                            currentQuantity * conversionFactor;

                                                        if (
                                                            quantityInOtherItems +
                                                            newQuantityInBase >
                                                            stock
                                                        ) {
                                                            error(
                                                                `No hay stock suficiente para cambiar a ${unit.name}`
                                                            );
                                                            return;
                                                        }

                                                        setValue(
                                                            `items.${index}.product_unit_id`,
                                                            unitId,
                                                            {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                            }
                                                        );

                                                        setValue(
                                                            `items.${index}.unit_quantity`,
                                                            conversionFactor,
                                                            {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                            }
                                                        );
                                                    }}
                                                    onChangeUnitPrice={(price) =>
                                                        setValue(`items.${index}.unit_price`, price, {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                        })
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 rounded-xl border bg-muted/30 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-medium">Resumen</span>
                                        <span className="text-xs text-muted-foreground">
                                            {items.length} productos
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {regimeCounts.zofra > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    <span>Régimen ZOFRA</span>
                                                </div>
                                                <span className="text-muted-foreground">
                                                    {regimeCounts.zofra}
                                                </span>
                                            </div>
                                        )}

                                        {regimeCounts.general > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span>Régimen General</span>
                                                </div>
                                                <span className="text-muted-foreground">
                                                    {regimeCounts.general}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="my-3 h-px bg-border" />

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>S/ {subTotal.toFixed(2)}</span>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="font-semibold">Total</span>
                                        <span className="text-xl font-bold">
                                            S/ {subTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>

            <section className="mt-6 rounded-2xl border bg-card shadow-sm">
                <div className="border-b px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserRound size={18} />
                            </div>
                            <h2 className="font-semibold">
                                Cliente
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Selecciona el cliente asociado a la venta.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => openCreate()}
                        >
                            + Nuevo cliente
                        </Button>
                    </div>
                </div>

                <div className="p-5">
                    <Controller
                        name="customer_id"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Buscar cliente
                                </label>

                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    />

                                    <input
                                        type="text"
                                        value={searchCustomer}
                                        onChange={(e) =>
                                            setSearchCustomer(e.target.value)
                                        }
                                        placeholder="Nombre del cliente..."
                                        className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>

                                <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
                                    {customerLoading ? (
                                        <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                                            Buscando clientes...
                                        </div>
                                    ) : customerResults.length === 0 ? (
                                        <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                                            No se encontraron clientes.
                                        </div>
                                    ) : (
                                        customerResults.map((customer) => (
                                            <CustomerSearchItem
                                                key={customer.id}
                                                customer={customer}
                                                selected={
                                                    field.value === customer.id
                                                }
                                                onSelect={(customer) =>
                                                    field.onChange(customer.id)
                                                }
                                            />
                                        ))
                                    )}
                                </div>

                                {fieldState.error && (
                                    <p className="mt-2 text-sm text-destructive">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <CustomerFormModal
                        fetchData={fetchCustomers}
                        onSuccess={(customer) => {
                            setValue("customer_id", customer.id, {
                                shouldValidate: true,
                                shouldDirty: true,
                            });

                            setSearchCustomer(customer.full_name ?? "");
                        }}
                    />
                </div>
            </section>

            {lastRemoved && (
                <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-foreground px-4 py-2 text-background shadow-lg sm:bottom-6">
                    <span className="text-sm">
                        Producto eliminado del carrito
                    </span>

                    <button
                        type="button"
                        onClick={handleUndoRemove}
                        className="flex items-center gap-1 rounded-full bg-background/10 px-3 py-1 text-sm font-medium hover:bg-background/20"
                    >
                        <Undo2 size={14} />
                        Deshacer
                    </button>
                </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={() => {
                        useSaleStore.getState().startNew();
                        useCustomerDisplayStore.getState().clear();
                        publishClear();
                        router.push("/sales/sale")
                    }}
                >
                    Cancelar
                </Button>

                <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={async () => {
                        if (isSubmitting) return;

                        // Se abre dentro del gesto para evitar el bloqueador de popups.
                        void openCustomerDisplay();

                        setIsSubmitting(true);

                        try {
                            const valid = await trigger?.(["items", "customer_id"]);

                            if (valid) {
                                router.push("/sales/sale/add/payments");
                            }
                        } finally {
                            setIsSubmitting(false);
                        }
                    }}
                >
                    {isSubmitting ? "Validando..." : "Siguiente →"}
                </Button>
            </div>
        </div>
    );

}