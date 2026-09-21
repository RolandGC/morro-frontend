import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { useBrandStore } from "../store/brand.store";
import { BrandForm, brandSchema } from "../validators/brandSchema";
import { brandService } from "../services/brands.service";

interface BrandFormProps {
    onSuccess?: () => void;
    fetchData: () => void;
    onCreated?: (brand: {
        id: string;
        name: string;
    }) => void;
}

const booleanOptions = [
    { id: "1", name: "Sí", value: true },
    { id: "2", name: "No", value: false },
];

export default function BrandFormModal({
    onSuccess,
    fetchData,
    onCreated,
}: BrandFormProps) {
    const {
        isEditing,
        brand,
        open,
        close,
        brand_id,
    } = useBrandStore();

    const { notify: showToast } = useToast();

    const {
        register,
        handleSubmit,
        control,
        reset: resetForm,
        formState: {
            errors,
            isSubmitting,
        },
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
            resetForm({
                name: "",
                is_active: true,
            });
        }
    }, [brand, isEditing, resetForm]);

    const onSubmit = async (brandForm: BrandForm) => {
        try {
            let response;

            if (isEditing && brand_id) {
                response = await brandService.update(
                    brand_id,
                    brandForm
                );
            } else {
                response = await brandService.create(
                    brandForm
                );
            }

            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing
                        ? "Marca actualizada correctamente"
                        : "Marca creada correctamente",
                    "success"
                );

                await fetchData();

                // Solo necesitamos devolver la marca
                // cuando estamos creando.
                if (!isEditing) {
                    const createdBrand = response.data;

                    onCreated?.({
                        id: createdBrand.id,
                        name: createdBrand.name,
                    });
                }

                resetForm();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast(
                "Error al guardar la marca",
                "error"
            );

            console.error(error);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) {
                    close();
                }
            }}
        >
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">
                        {isEditing
                            ? "Editar marca"
                            : "Crear marca"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 w-full">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 w-full"
                    >
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
                                            const selected =
                                                booleanOptions.find(
                                                    (option) =>
                                                        option.id === id
                                                );

                                            field.onChange(
                                                selected?.value ?? true
                                            );
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

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Guardando..."
                                    : isEditing
                                        ? "Actualizar marca"
                                        : "Guardar marca"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
