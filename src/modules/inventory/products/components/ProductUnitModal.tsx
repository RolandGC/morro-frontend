"use client";

import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useBrandStore } from "@/modules/inventory/brands/store/brand.store";
import { useCategoryStore } from "@/modules/core/category/store/category.store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductUnit } from "../types/produc.type";
import { productUnitService } from "../services/producUnit.service";
import { useProductUnitStore } from "../store/productUnit.store";
import { DataTable } from "@/components/DataTable";
import { ProductUnitForm, productUnitSchema } from "../validators/productUnitSchema";
import { getColumns } from "./ColumnsProdUnit";

interface ProductUnitProps {
    onSuccess?: () => void;
}

export default function ProductUnitModal({ onSuccess }: ProductUnitProps) {
    const { mode, product_id, product_unit_id, open, close, productUnit, openCreate, backToList } = useProductUnitStore();
    const { notify: showToast } = useToast();
    const [data, setData] = useState<ProductUnit[]>([]);

    const defaultValues = productUnit

    useEffect(() => {
        console.log("valor", open)
    }, [open, product_id])

    const { register, handleSubmit,
        control, reset: resetForm,
        formState: { errors } } = useForm<ProductUnitForm>({
            resolver: zodResolver(productUnitSchema),
            defaultValues,
        });
    const brands = useBrandStore((state) => state.brands);
    const categories = useCategoryStore((state) => state.categories);

    const fetchData = async () => {
        try {
            const response = await productUnitService.getAll(product_id ?? '');
            if (response.status === 200) {
                setData(response.data);
            }
        } catch (error) {
            console.error("Error fetching product units:", error);
        }
    };

    useEffect(() => {
        try {
            if (product_id) {
                fetchData();
            }
        } catch (error) {
            console.error("Error product units", error)
        }
    }, [product_id]);

    const is_default = [
        { id: "1", name: "Sí", value: true },
        { id: "2", name: "No", value: false },
    ];

    useEffect(() => {
        if (mode === "edit") {
            resetForm({
                name: productUnit.name,
                barcode: productUnit.barcode,
                conversion_factor: productUnit.conversion_factor,
                is_default: productUnit.is_default,
            });
        }

        if (mode === "create") {
            resetForm({
                name: "",
                barcode: "",
                conversion_factor: 1,
                is_default: false,
            });
        }
    }, [mode, productUnit, resetForm]);

    useEffect(() => {
        if (mode === "list" && product_id) {
            fetchData();
        }
    }, [mode, product_id]);

    const onSubmit = async (productUnit: ProductUnitForm) => {
        console.log("DATA OK", productUnit);
        try {
            let response;

            if (mode === "edit" && product_unit_id) {
                response = await productUnitService.update(product_id ?? '', product_unit_id, productUnit);
            } else {
                response = await productUnitService.create(product_id ?? '', productUnit);
            }

            if (response.status === 201 || response.status === 200) {
                showToast(
                    mode === "edit" ? "Producto actualizado correctamente" : "Producto creado correctamente",
                    "success"
                );
                resetForm();
                backToList();

                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar el producto", "error");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest(".swal2-container")) {
                        e.preventDefault();
                    }
                }}
                onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest(".swal2-container")) {
                        e.preventDefault();
                    }
                }} >

                <DialogHeader>
                    <DialogTitle>{mode === "list" ? "Lista de unidad de producto" : "Formulario de unidad de producto"}</DialogTitle>
                    <DialogDescription>
                        Es la presentación de conteo o venta del producto, por ejemplo: caja, docena, paquete, etc.
                    </DialogDescription>
                </DialogHeader>
                {mode === "list" && (
                    <>
                        <Button onClick={openCreate} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear unidad producto</Button>
                        <DataTable columns={getColumns({ fetchData })} data={data} />
                    </>
                )}

                {((mode === "create" || mode === "edit")) && (<div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="name"
                                label="Nombre tipo de unidad"
                                register={register}
                                error={errors.name}
                            />

                            <InputText
                                name="conversion_factor"
                                label="Factor de conversión"
                                register={register}
                                error={errors.conversion_factor}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="barcode"
                                label="Código de barra"
                                register={register}
                                error={errors.barcode}
                            />

                            <Controller
                                name="is_default"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Por defecto"
                                        value={field.value ? is_default[0].id : is_default[1].id}
                                        options={is_default}
                                        onSelect={(id) => {
                                            const selected = is_default.find((t) => t.id === id);
                                            field.onChange(selected?.value ?? true);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button type="button"
                                onClick={backToList}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {mode === "edit" ? "Actualizar unidad producto" : "Guardar unidad producto"}
                            </Button>
                        </div>
                    </form>
                </div>)}
            </DialogContent>
        </Dialog>
    );
}