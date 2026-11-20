
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Package, Search, X } from "lucide-react";

import { productService } from "@/modules/inventory/products/services/product.service";
import type { Product } from "@/modules/inventory/products/types/produc.type";

import { cn } from "@/lib/utils";

interface ProductSelectorProps {
    value?: string;
    onSelect: (product: Product) => void;
    onClear?: () => void;
    label?: string;
    placeholder?: string;
    error?: { message?: string };
    disabled?: boolean;
    selectedProduct?: Product;
}

export default function ProductSelector({
    value,
    onSelect,
    onClear,
    label = "Producto",
    placeholder = "Buscar por nombre, SKU o código de barras...",
    error,
    disabled = false,
    selectedProduct,
}: ProductSelectorProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef(0);
    const selectedRef = useRef(false);

    // Sincronizar producto seleccionado.
    useEffect(() => {
        if (selectedProduct) {
            selectedRef.current = true;

            setQuery(
                [selectedProduct.name, selectedProduct.model]
                    .filter(Boolean)
                    .join(" - ")
            );
        } else if (!value) {
            selectedRef.current = false;
            setQuery("");
        }
    }, [selectedProduct?.id, value]);

    // Cerrar resultados al hacer clic fuera.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Búsqueda inteligente.
    useEffect(() => {
        const term = query.trim();

        if (!term || selectedRef.current || disabled) {
            setResults([]);
            setLoading(false);
            return;
        }

        const requestId = ++requestRef.current;
        let active = true;

        const timer = setTimeout(async () => {
            setLoading(true);

            try {
                const [byBarcode, byName] = await Promise.all([
                    productService.getAll({
                        barcode: term,
                        is_active: true,
                        limit: 8,
                    }),
                    productService.getAll({
                        name: term,
                        is_active: true,
                        limit: 8,
                    }),
                ]);

                if (!active || requestRef.current !== requestId) return;

                const barcodeProducts =
                    byBarcode.status === 200
                        ? byBarcode.data.data
                        : [];

                const nameProducts =
                    byName.status === 200
                        ? byName.data.data
                        : [];

                console.log("Término:", term);
                console.log("Productos por barcode:", barcodeProducts);

                // Buscar coincidencia exacta.
                const exactBarcodeProduct = barcodeProducts.find(
                    (product) => {
                        const barcode = (product as Product & {
                            barcode?: string | number | null;
                        }).barcode;

                        return String(barcode ?? "").trim() === term;
                    }
                );

                if (exactBarcodeProduct) {
                    handleSelect(exactBarcodeProduct);
                    return;
                }

                // Si no es código exacto, mostrar resultados.
                const products = new Map<string, Product>();

                [...nameProducts, ...barcodeProducts].forEach((product) => {
                    products.set(product.id, product);
                });

                setResults([...products.values()]);
                setOpen(true);
            } catch (error) {
                console.error("Error buscando productos:", error);

                if (active) setResults([]);
            } finally {
                if (active && requestRef.current === requestId) {
                    setLoading(false);
                }
            }
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query, disabled]);

    const handleSelect = (product: Product) => {
        // Invalidar cualquier búsqueda pendiente.
        requestRef.current++;
        selectedRef.current = true;

        setQuery(
            [product.name, product.model]
                .filter(Boolean)
                .join(" - ")
        );

        setResults([]);
        setLoading(false);
        setOpen(false);

        onSelect(product);
    };

    const handleClear = () => {
        requestRef.current++;
        selectedRef.current = false;

        setQuery("");
        setResults([]);
        setLoading(false);
        setOpen(false);

        onClear?.();
    };

    const handleChange = (value: string) => {
        selectedRef.current = false;
        setQuery(value);
        setOpen(true);
    };

    return (
        <div className="flex flex-col gap-1" ref={containerRef}>
            <label className="text-sm font-medium">
                {label}
            </label>

            <div className="relative">
                <div
                    className={cn(
                        "flex h-10 items-center gap-2 rounded-md border bg-background px-3 transition-colors",
                        "focus-within:border-primary",
                        error && "border-red-500",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    {loading ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                        <Search className="size-4 text-muted-foreground" />
                    )}

                    <input
                        value={query}
                        disabled={disabled}
                        placeholder={placeholder}
                        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        onChange={(event) =>
                            handleChange(event.target.value)
                        }
                        onFocus={() => {
                            if (!selectedRef.current && query.trim()) {
                                setOpen(true);
                            }
                        }}
                    />

                    {query && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground"
                            title="Limpiar producto"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {open && !selectedRef.current && (
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover shadow-lg">
                        {loading && results.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" />
                                Buscando productos...
                            </div>
                        ) : results.length > 0 ? (
                            results.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => handleSelect(product)}
                                    className="flex w-full items-start gap-3 border-b p-3 text-left last:border-0 hover:bg-accent"
                                >
                                    <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {product.name}
                                        </p>

                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            {product.model && (
                                                <span>
                                                    Modelo: {product.model}
                                                </span>
                                            )}


                                            {/* {product.barcode && (
                                                <span>
                                                    Código: {product.barcode}
                                                </span>
                                            )} */}
                                        </div>
                                    </div>

                                    {value === product.id && (
                                        <Check className="size-4 text-primary" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No se encontraron productos.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error?.message && (
                <p className="px-2 text-[13px] text-red-500">
                    {error.message}
                </p>
            )}
        </div>
    );
}
