"use client";

import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { Button } from "@/components/ui/button";
import { productService } from "@/modules/inventory/products/services/product.service";
import { regime } from "@/types/types";
import { useEffect } from "react";
import { useProductStore } from "../store/product.store";
import { useToast } from "@/hooks/useToast";
import { useBrandStore } from "@/modules/inventory/brands/store/brand.store";
import { useCategoryStore } from "@/modules/core/category/store/category.store";
import { useForm, Controller } from "react-hook-form";
import { ProductForm, productSchema } from "../validators/productSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BrandFormModal from "../../brands/components/BrandFormModal";
import { brandService } from "../../brands/services/brands.service";
import { Brand } from "../../brands/types/brand.types";
import { categoryService } from "@/modules/core/category/services/category.service";
import CategoryFormModal from "@/modules/core/category/components/CategoryFormModal";

interface ProductFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}

export default function ProductFormModal({ onSuccess, fetchData }: ProductFormProps) {
    const { product, isEditing, product_id, open, close } = useProductStore();
    const { notify: showToast } = useToast();
    const defaultValues = product
    const { register, handleSubmit,
        control, reset: resetForm,
        setValue,
        formState: { errors, isSubmitting } } = useForm<ProductForm>({
            resolver: zodResolver(productSchema),
            defaultValues,
        });
    const {
        brands,
        openCreate: openCreateBrand,
    } = useBrandStore();
    const {
        categories,
        openCreate: openCreateCategory,
    } = useCategoryStore();

    useEffect(() => {
        if (!open) {
            resetForm(defaultValues);
            return;
        }

        if (isEditing && product) {
            resetForm({
                name: product.name ?? "",
                model: product.model ?? "",
                unit_base: product.unit_base ?? "",
                brand_id: product.brand_id ?? "",
                category_id: product.category_id ?? "",
                regime: product.regime,
                has_igv: product.has_igv,
                track_stock: product.track_stock,
            });
        } else {
            resetForm(defaultValues);
        }
    }, [open, isEditing, product, resetForm]);

    const regimeTypes = [
        { id: "1", name: "General", value: regime.general },
        { id: "2", name: "Mixto", value: regime.mixed },
        { id: "3", name: "Zofra", value: regime.zofra },
    ];

    const has_igv = [
        { id: "1", name: "Sí", value: true },
        { id: "2", name: "No", value: false },
    ];

    const track_stock = [
        { id: "1", name: "Sí", value: true },
        { id: "2", name: "No", value: false },
    ];

    useEffect(() => {
        if (isEditing && product) {
            resetForm({
                name: product.name ?? "",
                model: product.model ?? "",
                //unit_base: product.unit_base ?? "",
                brand_id: product.brand_id ?? "",
                category_id: product.category_id ?? "",
                regime: product.regime,
                has_igv: product.has_igv,
                track_stock: product.track_stock,
            });
        } else {
            resetForm(defaultValues);
        }
    }, [product, isEditing, resetForm]);

    const onSubmit = async (product: ProductForm) => {
        console.log("DATA OK", product);
        try {
            let response;

            if (isEditing && product_id) {
                response = await productService.update(product_id, product);
            } else {
                response = await productService.create(product);
            }

            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Producto actualizado correctamente" : "Producto creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar el producto", "error");
            console.error(error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await brandService.getAll();

            if (response.status === 200) {
                useBrandStore.setState({
                    brands: response.data.data,
                });
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };


    const handleBrandCreated = async (brand: {
        id: string;
        name: string;
    }) => {
        await fetchBrands();

        setValue("brand_id", brand.id, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };


    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();

            if (response.status === 200) {
                useCategoryStore.setState({
                    categories: response.data.data,
                });
            }
        } catch (error) {
            console.error(
                "Error fetching categories:",
                error
            );
        }
    };

    const handleCategoryCreated = async (category: {
        id: string;
        name: string;
    }) => {
        // Refrescamos las categorías desde el backend
        await fetchCategories();

        // Seleccionamos automáticamente la categoría creada
        setValue("category_id", category.id, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };


    return (
        <>
            <Dialog open={open} onOpenChange={close}>
                <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar producto" : "Crear producto"}</DialogTitle>
                        <DialogDescription>
                            Complete la información del producto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 w-full">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputText
                                    name="name"
                                    label="Nombre del producto"
                                    register={register}
                                    error={errors.name}
                                />

                                <InputText
                                    name="model"
                                    label="Modelo"
                                    register={register}
                                    error={errors.model}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="brand_id"
                                    control={control}
                                    render={({ field }) => (
                                        <SimpleSelector
                                            label="Marca"
                                            value={field.value}
                                            options={brands.map((brand) => ({
                                                id: brand.id,
                                                name: brand.name,
                                            }))}
                                            onSelect={field.onChange}
                                            error={errors.brand_id}
                                            onAdd={openCreateBrand}
                                            addLabel="Agregar marca"
                                        />
                                    )}
                                />

                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <SimpleSelector
                                            label="Categoría"
                                            value={field.value}
                                            options={categories.map((category) => ({
                                                id: category.id,
                                                name: category.name,
                                            }))}
                                            onSelect={field.onChange}
                                            error={errors.category_id}
                                            onAdd={openCreateCategory}
                                            addLabel="Agregar categoría"
                                        />
                                    )}
                                />

                            </div>

                            <Controller
                                name="regime"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Régimen"
                                        value={regimeTypes.find((r) => r.value === field.value)?.id}
                                        options={regimeTypes}
                                        onSelect={(id) => {
                                            const selected = regimeTypes.find((r) => r.id === id);
                                            field.onChange(selected?.value ?? regime.general);
                                        }}
                                    />
                                )}
                            />

                            {/* <InputText
                            name="unit_base"
                            label="Unidad de medida"
                            register={register}
                            error={errors.unit_base}
                        /> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="has_igv"
                                    control={control}
                                    render={({ field }) => (
                                        <SimpleSelector
                                            label="Tiene IGV"
                                            value={field.value ? has_igv[0].id : has_igv[1].id}
                                            options={has_igv}
                                            onSelect={(id) => {
                                                const selected = has_igv.find((h) => h.id === id);
                                                field.onChange(selected?.value ?? true);
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="track_stock"
                                    control={control}
                                    render={({ field }) => (
                                        <SimpleSelector
                                            label="Llevar stock"
                                            value={field.value ? track_stock[0].id : track_stock[1].id}
                                            options={track_stock}
                                            onSelect={(id) => {
                                                const selected = track_stock.find((t) => t.id === id);
                                                field.onChange(selected?.value ?? true);
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={close}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {isSubmitting
                                        ? "Guardando..." : isEditing ? "Actualizar producto" : "Guardar producto"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
            <BrandFormModal
                fetchData={fetchBrands}
                onCreated={handleBrandCreated}
            />
            <CategoryFormModal
                fetchData={fetchCategories}
                onCreated={handleCategoryCreated}
            />
        </>

    );
}