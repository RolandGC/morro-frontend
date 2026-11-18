"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Package, ScanBarcode, Search, ShoppingCart, Undo2, UserRound, ArrowRight, CircleCheck, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { EmptyState } from "@/components/empty-state";
import { SearchField } from "@/components/search-field";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
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
    const [customerPickerOpen, setCustomerPickerOpen] = useState(false);

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


    useEffect(() => {
        const focusBarcode = () => {
            barcodeInputRef.current?.focus();
        };
        focusBarcode();
        const frame = requestAnimationFrame(focusBarcode);
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (
                target.closest(
                    "input, textarea, select, button, [contenteditable='true'], [role='dialog']"
                )
            ) {
                return;
            }

            barcodeInputRef.current?.focus();
        };

        document.addEventListener("click", handleGlobalClick);

        return () => {
            document.removeEventListener("click", handleGlobalClick);
        };
    }, []);

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

    const [lastRemoved, setLastRemoved] = useState<{ item: SaleForm["items"][number]; index: number } | null>(null);
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

    const fetchCustomers = async (search = "") => {
        try {
            setCustomerLoading(true);

            const value = search.trim();

            const isDocument = /^\d+$/.test(value);

            const response = await customerService.getAll({
                full_name: isDocument ? "" : value,
                doc_number: isDocument ? value : "",
                is_active: true,
                page: 1,
                limit: 10,
            });

            if (response.status === 200) {
                setCustomerResults(response.data?.data ?? []);
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

    const handleCancel = () => {
        useSaleStore.getState().startNew();
        useCustomerDisplayStore.getState().clear();
        publishClear();
        router.push("/sales/sale");
    };

    const handleContinue = async () => {
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
    };

    return (
        <div className="mx-auto w-full max-w-400 px-4 pb-24 pt-2 lg:px-6 lg:pb-8">
            <PageHeader
                icon={ShoppingCart}
                title="Nueva venta"
                description="Escanea productos, asigna el cliente y continúa al cobro."
                actions={
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        <X className="size-4" />
                        Cancelar
                    </Button>
                }
            />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:items-start xl:gap-5">
                <SectionCard
                    icon={Package}
                    title="Catálogo"
                    description="Escanea un código de barras o busca por nombre"
                    badge={
                        productResults.length > 0 ? (
                            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                {productResults.length}{" "}
                                {productResults.length === 1
                                    ? "resultado"
                                    : "resultados"}
                            </span>
                        ) : null
                    }
                    bodyClassName="gap-3"
                >
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="sale-barcode"
                                className="mb-1 block text-xs font-medium text-muted-foreground"
                            >
                                Código de barras
                            </label>
                            <SearchField
                                ref={barcodeInputRef}
                                id="sale-barcode"
                                icon={ScanBarcode}
                                placeholder="Escanear código..."
                                hint="Enter"
                                autoComplete="off"
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
                        <div>
                            <label
                                htmlFor="sale-product-search"
                                className="mb-1 block text-xs font-medium text-muted-foreground"
                            >
                                Buscar por nombre
                            </label>
                            <SearchField
                                id="sale-product-search"
                                icon={Search}
                                placeholder="Nombre o modelo..."
                                autoComplete="off"
                                value={searchProduct}
                                onChange={(e) =>
                                    setSearchProduct(e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="max-h-[calc(100vh-23rem)] min-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-slim">
                        {productLoading ? (
                            <div className="space-y-2">
                                {[0, 1, 2, 3, 4].map((row) => (
                                    <div
                                        key={row}
                                        className="h-15.5 animate-pulse rounded-lg bg-muted/60"
                                    />
                                ))}
                            </div>
                        ) : productResults.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title="Sin resultados"
                                description="Prueba con otro término o verifica el código escaneado."
                            />
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
                </SectionCard>
                <div className="flex min-h-0 flex-col gap-4 lg:sticky lg:top-20">
                    {/* CLIENTE */}
                    <SectionCard
                        icon={UserRound}
                        title="Cliente"
                        description="Requerido para registrar la venta"
                        bodyClassName="gap-2"
                        actions={
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openCreate()}
                            >
                                <Plus className="size-3.5" />
                                Nuevo
                            </Button>
                        }
                    >
                        <Controller
                            name="customer_id"
                            control={control}
                            render={({ field, fieldState }) => {
                                const selectedCustomer = customerResults.find(
                                    (customer) => customer.id === field.value
                                );
                                const showPicker =
                                    customerPickerOpen || !field.value;
                                return (
                                    <div className="space-y-2">
                                        {field.value && !customerPickerOpen && (
                                            <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <CircleCheck className="size-4 shrink-0 text-primary" />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {selectedCustomer?.full_name ??
                                                                (searchCustomer ||
                                                                    "Cliente seleccionado")}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {selectedCustomer?.doc_number ??
                                                                "Asignado a esta venta"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="shrink-0"
                                                    onClick={() =>
                                                        setCustomerPickerOpen(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Cambiar
                                                </Button>
                                            </div>
                                        )}
                                        {showPicker && (
                                            <>
                                                <SearchField
                                                    icon={Search}
                                                    placeholder="Buscar por documento o nombre..."
                                                    autoComplete="off"
                                                    value={searchCustomer}
                                                    onFocus={() =>
                                                        setCustomerPickerOpen(
                                                            true
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        setSearchCustomer(
                                                            e.target.value
                                                        );
                                                        setCustomerPickerOpen(
                                                            true
                                                        );
                                                    }}
                                                />
                                                <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1 scrollbar-slim">
                                                    {customerLoading ? (
                                                        <>
                                                            <div className="h-12 animate-pulse rounded-lg bg-muted/60" />
                                                            <div className="h-12 animate-pulse rounded-lg bg-muted/60" />
                                                        </>
                                                    ) : customerResults.length ===
                                                      0 ? (
                                                        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                                                            No se encontraron
                                                            clientes.
                                                        </p>
                                                    ) : (
                                                        customerResults.map(
                                                            (customer) => (
                                                                <CustomerSearchItem
                                                                    key={ customer.id}
                                                                    customer={customer}
                                                                    selected={
                                                                        field.value ===
                                                                        customer.id
                                                                    }
                                                                    onSelect={(
                                                                        customer
                                                                    ) => {
                                                                        field.onChange(
                                                                            customer.id
                                                                        );
                                                                        setSearchCustomer(
                                                                            customer.full_name
                                                                        );
                                                                        setCustomerPickerOpen(
                                                                            false
                                                                        );
                                                                    }}
                                                                />
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {fieldState.error && (
                                            <p className="text-xs font-medium text-destructive">
                                                {fieldState.error.message}
                                            </p>
                                        )}
                                    </div>
                                );
                            }}
                        />
                        <CustomerFormModal
                            fetchData={fetchCustomers}
                            onSuccess={(customer) => {
                                setValue("customer_id", customer.id, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                });
                                setSearchCustomer(customer.full_name ?? "");
                                setCustomerPickerOpen(false);
                            }}
                        />
                    </SectionCard>
                    <SectionCard
                        icon={ShoppingCart}
                        title="Carrito"
                        badge={
                            items.length > 0 ? (
                                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                    {items.length}
                                </span>
                            ) : null
                        }
                        bodyClassName="p-0 gap-0"
                    >
                        <div className="max-h-[46vh] min-h-44 space-y-2 overflow-y-auto p-4 scrollbar-slim">
                            {items.length === 0 ? (
                                <EmptyState
                                    icon={ShoppingCart}
                                    title="Carrito vacío"
                                    description="Selecciona un producto del catálogo para comenzar la venta."
                                    compact
                                />
                            ) : (
                                items.map((item, index) => {
                                    const product = products.find(
                                        (p) => p.id === item.product_id
                                    );
                                    if (!product) return null;
                                    const isJustAdded =
                                        `${item.product_id}-${item.product_unit_id}` ===
                                        justAddedKey;
                                    return (
                                        <div
                                            key={fields[index]?.id}
                                            className={cn(
                                                "rounded-lg transition-all duration-300",
                                                isJustAdded &&
                                                    "ring-2 ring-primary/30 ring-offset-1 ring-offset-card"
                                            )}
                                        >
                                            <ProductCard
                                                product={product}
                                                quantity={Number(
                                                    item.quantity ?? 0
                                                )}
                                                units={product.product_units}
                                                selectedUnitId={
                                                    item.product_unit_id
                                                }
                                                unitPrice={Number(
                                                    item.unit_price ??
                                                        product.unit_price
                                                )}
                                                availableStock={getAvailableStock(
                                                    product
                                                )}
                                                onIncrease={() =>
                                                    handleIncrease(index)
                                                }
                                                onDecrease={() =>
                                                    handleDecrease(index)
                                                }
                                                onRemove={() =>
                                                    handleRemoveItem(index)
                                                }
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
                                                onSelectUnit={(unitId) => {
                                                    const unit =
                                                        product.product_units?.find(
                                                            (unit) =>
                                                                unit.id ===
                                                                unitId
                                                        );
                                                    if (!unit) return;
                                                    const conversionFactor =
                                                        Number(
                                                            unit.conversion_factor ??
                                                                1
                                                        );
                                                    const currentQuantity =
                                                        Number(
                                                            item.quantity ?? 0
                                                        );
                                                    const stock = Number(
                                                        product
                                                            .warehouse_stock?.[0]
                                                            ?.quantity ?? 0
                                                    );
                                                    const quantityInOtherItems =
                                                        items.reduce(
                                                            (
                                                                total,
                                                                currentItem,
                                                                currentIndex
                                                            ) => {
                                                                if (
                                                                    currentIndex ===
                                                                        index ||
                                                                    currentItem.product_id !==
                                                                        product.id
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
                                                                    Number(
                                                                        currentItem.quantity ??
                                                                            0
                                                                    ) *
                                                                        factor
                                                                );
                                                            },
                                                            0
                                                        );
                                                    const newQuantityInBase =
                                                        currentQuantity *
                                                        conversionFactor;
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
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="border-t bg-muted/20 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span className="money font-medium">
                                    {formatCurrency(subTotal)}
                                </span>
                            </div>
                            <div className="mt-1 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Total
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {items.length}{" "}
                                        {items.length === 1
                                            ? "producto"
                                            : "productos"}
                                    </p>
                                </div>
                                <p className="money text-2xl font-semibold tracking-tight text-foreground">
                                    {formatCurrency(subTotal)}
                                </p>
                            </div>
                            {(regimeCounts.zofra > 0 ||
                                regimeCounts.general > 0) && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                                    {regimeCounts.zofra > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1 text-success">
                                            <span className="size-1.5 rounded-full bg-success" />
                                            ZOFRA {regimeCounts.zofra}
                                        </span>
                                    )}
                                    {regimeCounts.general > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2 py-1 text-info">
                                            <span className="size-1.5 rounded-full bg-info" />
                                            General {regimeCounts.general}
                                        </span>
                                    )}
                                </div>
                            )}
                            <Button
                                type="button"
                                className="mt-3 h-11 w-full text-sm"
                                disabled={isSubmitting || items.length === 0}
                                onClick={handleContinue}
                            >
                                {isSubmitting ? "Validando..." : "Continuar al pago"}
                                {!isSubmitting && (
                                    <ArrowRight className="size-4" />
                                )}
                            </Button>
                            {itemsError && (
                                <p className="mt-2 text-xs font-medium text-destructive">
                                    {itemsError}
                                </p>
                            )}
                        </div>
                    </SectionCard>
                </div>
            </div>
            {lastRemoved && (
                <div className="fixed bottom-24 right-4 z-50 flex items-center gap-3 rounded-lg border bg-foreground px-4 py-2.5 text-background shadow-lg lg:bottom-6">
                    <span className="text-sm">Producto eliminado del carrito</span>
                    <button
                        type="button"
                        onClick={handleUndoRemove}
                        className="flex items-center gap-1 rounded-md bg-background/15 px-3 py-1 text-sm font-medium transition-colors hover:bg-background/25"
                    >
                        <Undo2 className="size-3.5" />
                        Deshacer
                    </button>
                </div>
            )}
            {/* Barra de acción fija en móvil: el total y el cobro no se pierden */}
            {items.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
                    <div className="mx-auto flex max-w-400 items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] text-muted-foreground">
                                {items.length}{" "}
                                {items.length === 1 ? "producto" : "productos"}
                            </p>
                            <p className="money text-lg font-semibold">
                                {formatCurrency(subTotal)}
                            </p>
                        </div>
                        <Button
                            type="button"
                            className="h-10 px-4"
                            disabled={isSubmitting}
                            onClick={handleContinue}
                        >
                            {isSubmitting ? "Validando..." : "Continuar"}
                            {!isSubmitting && (
                                <ArrowRight className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}