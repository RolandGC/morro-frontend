"use client";

import { useEffect, useRef, useState } from "react";
import {
    Controller,
    useFieldArray,
    useForm,
    useWatch,
    type FieldError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

import InputSearch from "@/components/InputSearch";
import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/useToast";
import type { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import {
    productService,
} from "@/modules/inventory/products/services/product.service";
import { productUnitService } from "@/modules/inventory/products/services/producUnit.service";
import type {
    Product,
    ProductUnit,
} from "@/modules/inventory/products/types/produc.type";

import { stockAdjustmentService } from "../services/stockAdjustment.service";
import { useStockAdjustmentStore } from "../store/stockAdjustment.store";
import {
    stockAdjustmentSchema,
    type StockAdjustmentForm,
} from "../validators/stockAdjustment";
import ProductSelector from "../../products/components/ProductSelector";

interface StockAdjustmentFormModalProps {
    fetchData: () => Promise<void>;
    warehouses: Warehouse[];
    onSuccess?: () => void;
}

interface SearchResult {
    id: string;
    label: string;
}

const emptyForm: StockAdjustmentForm = {
    warehouse_id: "",
    reason: "",
    items: [],
};

/**
 * Buscador por nombre o código de barras usando los filtros reales de
 * productService.getAll (name / barcode), igual que el módulo de compras.
 */
function AdjustmentProductSearch({
    index,
    error,
    onSelect,
    onClear,
}: {
    index: number;
    error?: FieldError;
    onSelect: (product: Product) => void;
    onClear: () => void;
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const catalog = useRef<Record<string, Product>>({});

    useEffect(() => {
        const term = query.trim();
        let active = true;

        const timer = setTimeout(() => {
            if (!term) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            void (async () => {
                try {
                    const [byName, byBarcode] = await Promise.all([
                        productService.getAll({
                            name: term,
                            is_active: true,
                            limit: 8,
                        }),
                        productService.getAll({
                            barcode: term,
                            is_active: true,
                            limit: 8,
                        }),
                    ]);

                    if (!active) return;

                    const found = new Map<string, Product>();

                    if (byName.status === 200) {
                        byName.data.data.forEach((product) =>
                            found.set(product.id, product)
                        );
                    }

                    if (byBarcode.status === 200) {
                        byBarcode.data.data.forEach((product) =>
                            found.set(product.id, product)
                        );
                    }

                    catalog.current = Object.fromEntries(found);
                    setResults(
                        [...found.values()].map((product) => ({
                            id: product.id,
                            label: [product.name, product.model]
                                .filter(Boolean)
                                .join(" - "),
                        }))
                    );
                } catch (searchError) {
                    console.error("Error buscando productos:", searchError);
                    if (active) setResults([]);
                } finally {
                    if (active) setLoading(false);
                }
            })();
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query]);

    return (
        <div className="flex flex-col gap-1">
            <InputSearch
                label={`Producto ${index + 1}`}
                placeholder="Buscar por nombre o código"
                value={query}
                results={results}
                loading={loading}
                onChange={setQuery}
                onSelect={(item) => {
                    const product = catalog.current[item.id];
                    if (product) onSelect(product);
                }}
                onClear={() => {
                    setQuery("");
                    setResults([]);
                    onClear();
                }}
            />

            {error && (
                <p className="text-[13px] text-red-500 px-2 -my-2 py-1">
                    {error.message}
                </p>
            )}
        </div>
    );
}

export default function StockAdjustmentFormModal({
    fetchData,
    warehouses,
    onSuccess,
}: StockAdjustmentFormModalProps) {
    const { createOpen, close } = useStockAdjustmentStore();
    const { notify } = useToast();

    const [unitsByProduct, setUnitsByProduct] = useState<
        Record<string, ProductUnit[]>
    >({});
    const unitRequestRef = useRef<Record<string, number>>({});

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StockAdjustmentForm>({
        resolver: zodResolver(stockAdjustmentSchema),
        defaultValues: emptyForm,
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "items",
    });

    const watchedItems = useWatch({ control, name: "items" }) ?? [];

    useEffect(() => {
        if (createOpen) reset(emptyForm);
    }, [createOpen, reset]);

    const warehouseOptions = warehouses.map((warehouse) => ({
        id: warehouse.id,
        name: warehouse.name,
    }));

    const handleProductSelect = async (
        index: number,
        product: Product
    ) => {
        const initialUnits = product.product_units ?? [];

        const initialDefault =
            initialUnits.find((unit) => unit.is_default) ??
            initialUnits[0];

        setUnitsByProduct((previous) => ({
            ...previous,
            [product.id]: initialUnits,
        }));

        // IMPORTANTE: actualizar únicamente los campos necesarios.
        // No utilizar replace() porque puede desmontar los componentes.
        setValue(`items.${index}.product_id`, product.id, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });

        setValue(
            `items.${index}.product_unit_id`,
            initialDefault?.id ?? "",
            {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            }
        );

        setValue(`items.${index}.quantity`, 0);

        setValue(`items.${index}.unit_cost`, undefined);

        // Cargar unidades.
        const request =
            (unitRequestRef.current[product.id] ?? 0) + 1;

        unitRequestRef.current[product.id] = request;

        try {
            const response = await productUnitService.getAll(product.id);

            if (response.status !== 200) {
                throw new Error("No se pudieron cargar las unidades");
            }

            if (unitRequestRef.current[product.id] !== request) return;

            setUnitsByProduct((previous) => ({
                ...previous,
                [product.id]: response.data,
            }));
        } catch (error) {
            console.error("Error cargando unidades:", error);
            notify("No se pudieron cargar las unidades del producto", "error");
        }
    };

    const handleClearProduct = (index: number) => {
        setValue(`items.${index}.product_id`, "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setValue(`items.${index}.product_unit_id`, "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const onSubmit = async (form: StockAdjustmentForm) => {
        try {
            const response = await stockAdjustmentService.create(form);

            if (response.status !== 200 && response.status !== 201) {
                throw new Error("Respuesta inesperada al registrar el ajuste");
            }

            notify("Ajuste de stock registrado correctamente", "success");
            reset(emptyForm);
            close();
            await fetchData();
            onSuccess?.();
        } catch (error) {
            console.error("Error registrando ajuste de stock:", error);
            notify("No se pudo registrar el ajuste de stock", "error");
        }
    };

    return (
        <Dialog
            open={createOpen}
            onOpenChange={(value) => {
                if (!value) close();
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        Nuevo ajuste de stock
                    </DialogTitle>
                </DialogHeader>

                {warehouses.length === 0 ? (
                    <EmptyState
                        icon={AlertCircle}
                        title="No hay almacenes disponibles"
                        description="Registra un almacén activo antes de crear un ajuste de stock."
                    />
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-5"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                            <Controller
                                name="warehouse_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Almacén"
                                        options={warehouseOptions}
                                        value={field.value || undefined}
                                        onSelect={field.onChange}
                                        error={errors.warehouse_id}
                                    />
                                )}
                            />

                            <InputText
                                name="reason"
                                label="Motivo del ajuste"
                                placeholder="Ej. Ajuste por inventario físico"
                                register={register}
                                error={errors.reason}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Productos ajustados
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Cantidad positiva aumenta el stock,
                                        negativa lo disminuye. Cero no genera
                                        movimiento.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            product_id: "",
                                            product_unit_id: "",
                                            quantity: 0,
                                            unit_cost: undefined,
                                        })
                                    }
                                >
                                    <Plus className="mr-1.5 size-4" />
                                    Agregar producto
                                </Button>
                            </div>

                            {fields.length === 0 ? (
                                <EmptyState
                                    compact
                                    icon={Plus}
                                    title="Sin productos agregados"
                                    description="Agrega al menos un producto para poder registrar el ajuste."
                                />
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {fields.map((field, index) => {
                                        const productId =
                                            watchedItems[index]?.product_id ??
                                            "";
                                        const unitOptions =
                                            unitsByProduct[productId] ?? [];
                                        const quantity = Number(
                                            watchedItems[index]?.quantity ?? 0
                                        );
                                        const hasUnitCost =
                                            watchedItems[index]?.unit_cost !=
                                            null;

                                        return (
                                            <div
                                                key={field.id}
                                                className="grid grid-cols-1 items-start gap-3 rounded-lg border bg-muted/20 p-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_auto]"
                                            >
                                                <div>
                                                    <input
                                                        type="hidden"
                                                        {...register(
                                                            `items.${index}.product_id`
                                                        )}
                                                    />
                                                    <ProductSelector
                                                        label={`Producto ${index + 1}`}
                                                        value={productId}
                                                        error={errors.items?.[index]?.product_id}
                                                        onSelect={(product) => {
                                                            void handleProductSelect(index, product);
                                                        }}
                                                        onClear={() => handleClearProduct(index)}
                                                    />
                                                </div>

                                                <Controller
                                                    name={`items.${index}.product_unit_id`}
                                                    control={control}
                                                    render={({
                                                        field: unitField,
                                                    }) => (
                                                        <SimpleSelector
                                                            label="Unidad"
                                                            options={unitOptions.map(
                                                                (unit) => ({
                                                                    id: unit.id,
                                                                    name: [
                                                                        unit.name,
                                                                        `x${unit.conversion_factor}`,
                                                                    ]
                                                                        .filter(
                                                                            Boolean
                                                                        )
                                                                        .join(
                                                                            " "
                                                                        ),
                                                                })
                                                            )}
                                                            value={
                                                                unitField.value ||
                                                                undefined
                                                            }
                                                            onSelect={
                                                                unitField.onChange
                                                            }
                                                            error={
                                                                errors.items?.[
                                                                    index
                                                                ]?.product_unit_id
                                                            }
                                                        />
                                                    )}
                                                />

                                                <div className="flex flex-col gap-1">
                                                    <InputText
                                                        name={`items.${index}.quantity`}
                                                        label="Cantidad"
                                                        type="number"
                                                        step="any"
                                                        register={register}
                                                        registerOptions={{
                                                            valueAsNumber: true,
                                                        }}
                                                        error={
                                                            errors.items?.[index]
                                                                ?.quantity
                                                        }
                                                    />
                                                    <p className="text-[11px] text-muted-foreground">
                                                        + entra · − sale
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <InputText
                                                        name={`items.${index}.unit_cost`}
                                                        label="Costo unitario"
                                                        type="number"
                                                        step="0.01"
                                                        register={register}
                                                        registerOptions={{
                                                            setValueAs: (
                                                                value: string
                                                            ) =>
                                                                value.trim() ===
                                                                ""
                                                                    ? undefined
                                                                    : Number(
                                                                          value
                                                                      ),
                                                        }}
                                                        error={
                                                            errors.items?.[index]
                                                                ?.unit_cost
                                                        }
                                                    />
                                                    {quantity > 0 &&
                                                        !hasUnitCost && (
                                                            <p className="text-[11px] text-amber-600">
                                                                Requerido si no
                                                                hay stock previo.
                                                            </p>
                                                        )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="mt-6 text-red-500"
                                                    onClick={() => remove(index)}
                                                    title="Quitar producto"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {errors.items?.root?.message && (
                                <p className="text-[13px] text-red-500">
                                    {errors.items.root.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={close}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Guardando..."
                                    : "Guardar ajuste"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
