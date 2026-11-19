"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

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
import type { Product } from "@/modules/inventory/products/types/produc.type";

import { stockComparisonsService } from "../services/stockComparisons.service";
import { useStockComparisonStore } from "../store/stockComparison.store";
import {
    stockComparisonSchema,
    type StockComparisonForm,
} from "../validators/stockComparisonsSchema";

interface StockComparisonFormModalProps {
    fetchData: () => Promise<void>;
    warehouses: Warehouse[];
    products: Product[];
    onSuccess?: () => void;
}

const emptyForm: StockComparisonForm = {
    warehouse_id: "",
    reason: "",
    items: [],
};

export default function StockComparisonFormModal({
    fetchData,
    warehouses,
    products,
    onSuccess,
}: StockComparisonFormModalProps) {
    const { createOpen, close } = useStockComparisonStore();
    const { notify } = useToast();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StockComparisonForm>({
        resolver: zodResolver(stockComparisonSchema),
        defaultValues: emptyForm,
    });

    const { fields, append, remove } = useFieldArray({
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

    const productOptions = products.map((product) => ({
        id: product.id,
        name: [product.name, product.model].filter(Boolean).join(" - "),
    }));

    const getUnitOptions = (productId: string) => {
        const product = products.find((item) => item.id === productId);

        return (product?.product_units ?? []).map((unit) => ({
            id: unit.id,
            name: [unit.name, `x${unit.conversion_factor}`]
                .filter(Boolean)
                .join(" "),
        }));
    };

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((item) => item.id === productId);
        const defaultUnit =
            product?.product_units?.find((unit) => unit.is_default) ??
            product?.product_units?.[0];

        setValue(`items.${index}.product_id`, productId, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setValue(`items.${index}.product_unit_id`, defaultUnit?.id ?? "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        setValue(`items.${index}.counted_quantity`, 0, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const onSubmit = async (form: StockComparisonForm) => {
        try {
            const response = await stockComparisonsService.create(form);

            if (response.status !== 200 && response.status !== 201) {
                throw new Error("Respuesta inesperada al registrar la comparación");
            }

            notify("Comparación de stock registrada correctamente", "success");
            reset(emptyForm);
            close();
            await fetchData();
            onSuccess?.();
        } catch (error) {
            console.error("Error registrando comparación de stock:", error);
            notify("No se pudo registrar la comparación de stock", "error");
        }
    };

    const catalogsUnavailable =
        warehouses.length === 0 || products.length === 0;

    return (
        <Dialog
            open={createOpen}
            onOpenChange={(value) => {
                if (!value) close();
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        Nueva comparación de stock
                    </DialogTitle>
                </DialogHeader>

                {catalogsUnavailable ? (
                    <EmptyState
                        icon={AlertCircle}
                        title="No hay almacenes o productos disponibles"
                        description="Registra almacenes y productos activos antes de crear una comparación."
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
                                label="Motivo de la comparación"
                                placeholder="Ej. Auditoría de stock noviembre"
                                register={register}
                                error={errors.reason}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Productos contabilizados
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Registra la cantidad física encontrada por
                                        producto y unidad de medida.
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
                                            counted_quantity: 0,
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
                                    description="Agrega al menos un producto para poder registrar la comparación."
                                />
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {fields.map((field, index) => {
                                        const selectedProductId =
                                            watchedItems[index]?.product_id ?? "";
                                        const unitOptions =
                                            getUnitOptions(selectedProductId);

                                        return (
                                            <div
                                                key={field.id}
                                                className="grid grid-cols-1 items-start gap-3 rounded-lg border bg-muted/20 p-3 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]"
                                            >
                                                <div>
                                                    <input
                                                        type="hidden"
                                                        {...register(
                                                            `items.${index}.product_id`
                                                        )}
                                                    />
                                                    <SimpleSelector
                                                        label={`Producto ${index + 1}`}
                                                        options={productOptions}
                                                        value={
                                                            selectedProductId ||
                                                            undefined
                                                        }
                                                        onSelect={(id) =>
                                                            handleProductChange(
                                                                index,
                                                                id
                                                            )
                                                        }
                                                        error={
                                                            errors.items?.[index]
                                                                ?.product_id
                                                        }
                                                    />
                                                </div>

                                                <Controller
                                                    name={`items.${index}.product_unit_id`}
                                                    control={control}
                                                    render={({ field: unitField }) => (
                                                        <SimpleSelector
                                                            label="Unidad"
                                                            options={unitOptions}
                                                            value={
                                                                unitField.value ||
                                                                undefined
                                                            }
                                                            onSelect={unitField.onChange}
                                                            error={
                                                                errors.items?.[index]
                                                                    ?.product_unit_id
                                                            }
                                                        />
                                                    )}
                                                />

                                                <InputText
                                                    name={`items.${index}.counted_quantity`}
                                                    label="Cantidad contada"
                                                    type="number"
                                                    step="any"
                                                    register={register}
                                                    registerOptions={{
                                                        valueAsNumber: true,
                                                    }}
                                                    error={
                                                        errors.items?.[index]
                                                            ?.counted_quantity
                                                    }
                                                />

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
                                    : "Guardar comparación"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
