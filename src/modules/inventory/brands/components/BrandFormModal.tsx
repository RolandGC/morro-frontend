import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { useBrandStore } from "../store/brand.store";
import { BrandForm, brandSchema } from "../validators/brandSchema";
import { brandService } from "../services/brands.service";

interface BrandFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
const booleanOptions = [
    { id: "1", name: "Sí", value: true },
    { id: "2", name: "No", value: false },
];

export default function BrandFormModal({ onSuccess, fetchData }: BrandFormProps) {
    const { isEditing, brand, open, close, brand_id } = useBrandStore();
    const defaultValues = brand;
    const { notify: showToast } = useToast();


    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<BrandForm>({
        resolver: zodResolver(brandSchema),
        defaultValues: brand,
    });



    useEffect(() => {
        if (isEditing && brand) {
            resetForm({
                name: brand.name ?? "",
                is_active: brand.is_active,
            });
        } else {
            resetForm(defaultValues);
        }
    }, [brand, isEditing, resetForm]);

    const onSubmit = async (brand: BrandForm) => {
        try {
            let response;
            if (isEditing && brand_id) {
                response = await brandService.update(brand_id, brand);
            } else {
                response = await brandService.create(brand);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Marca actualizado correctamente" : "Marca creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar la marca", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar marca" : "Crear marca"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="name"
                                label="Nombre"
                                register={register}
                                error={errors.name}
                            />
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Activo"
                                        value={
                                            field.value
                                                ? booleanOptions[0].id
                                                : booleanOptions[1].id
                                        }
                                        options={booleanOptions}
                                        onSelect={(id) => {
                                            const selected = booleanOptions.find(
                                                (option) => option.id === id
                                            );
                                            field.onChange(selected?.value ?? true);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar marca"
                                    : "Guardar marca"}
                        </Button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}