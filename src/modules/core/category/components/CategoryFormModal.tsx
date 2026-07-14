import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { warehouse_type } from "@/types/types";
import { Company } from "../../companies/types/company.type";
import { companyService } from "../../companies/services/company.service";
import { useCategoryStore } from "../store/category.store";
import { CategoryForm, categorySchema } from "../validators/categorySchema";
import { categoryService } from "../services/category.service";

interface CategoryFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
const booleanOptions = [
    { id: "1", name: "Sí", value: true },
    { id: "2", name: "No", value: false },
];

export default function CategoryFormModal({ onSuccess, fetchData }: CategoryFormProps) {
    const { isEditing, category, open, close, category_id } = useCategoryStore();
    const defaultValues = category;
    const { notify: showToast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const categoryResponse = await companyService.getAllCompanies({ is_active: true });
                if (categoryResponse.status === 200) {
                    setCompanies(categoryResponse.data.data);
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            }

        };

        fetchCompanies();
    }, [setCompanies]);

    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<CategoryForm>({
        resolver: zodResolver(categorySchema),
        defaultValues: category,
    });

    const warehouses_type = [
        { id: "1", name: "General", value: warehouse_type.warehouse },
        { id: "2", name: "Mixto", value: warehouse_type.store },
    ];

    useEffect(() => {
        if (isEditing && category) {
            resetForm({
                name: category.name ?? "",
                description: category.description ?? "",
                parent_id: category.parent_id,
                //is_active: category.is_active ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [category, isEditing, resetForm]);

    const onSubmit = async (category: CategoryForm) => {
        try {
            let response;
            if (isEditing && category_id) {
                response = await categoryService.update(category_id, category);
            } else {
                response = await categoryService.create(category);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Categoría actualizado correctamente" : "Categoría creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar la categoría", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar categoría" : "Crear categoría"}</DialogTitle>
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
                            <InputText
                                name="description"
                                label="Descripción"
                                register={register}
                                error={errors.description}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                           {/*  <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Tipo"
                                        value={warehouses_type.find((r) => r.value === field.value)?.id}
                                        options={warehouses_type}
                                        onSelect={(id) => {
                                            const selected = warehouses_type.find((r) => r.id === id);
                                            field.onChange(selected?.value ?? warehouse_type.warehouse);
                                        }}
                                    />
                                )}
                            /> */}
                            {/* <Controller
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
                            /> */}
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar categoría"
                                    : "Guardar categoría"}
                        </Button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}