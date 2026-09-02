import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { WarehouseForm, warehouseSchema } from "../validators/warehouseSchema";
import { useWarehouseStore } from "../store/warehouse.store";
import { warehouseService } from "../services/warehouse.service";
import SimpleSelector from "@/components/SimpleSelector";
import { warehouse_type } from "@/types/types";
import { Company } from "../../companies/types/company.type";
import { companyService } from "../../companies/services/company.service";

interface WarehouseFormProps {
    onSuccess?: () => void;
    fetchWarehouses: () => void,
}
const booleanOptions = [
    { id: "1", name: "Sí", value: true },
    { id: "2", name: "No", value: false },
];

export default function WarehouseFormModal({ onSuccess, fetchWarehouses }: WarehouseFormProps) {
    const { isEditing, warehouse, open, close, warehouse_id } = useWarehouseStore();
    const defaultValues = warehouse;
    const { notify: showToast } = useToast();
    //const {company, companies} = useCompanyStore()
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
    } = useForm<WarehouseForm>({
        resolver: zodResolver(warehouseSchema),
        defaultValues: warehouse,
    });

    const warehouses_type = [
        { id: "1", name: "General", value: warehouse_type.warehouse },
        { id: "2", name: "Mixto", value: warehouse_type.store },
    ];

    useEffect(() => {
        if (isEditing && warehouse) {
            resetForm({
                name: warehouse.name ?? "",
                address: warehouse.address ?? "",
                type: warehouse.type ?? "",
                is_active: warehouse.is_active ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [warehouse, isEditing, resetForm]);

    const onSubmit = async (warehouse: WarehouseForm) => {
        try {
            let response;
            if (isEditing && warehouse_id) {
                response = await warehouseService.update(warehouse_id, warehouse);
            } else {
                response = await warehouseService.create(warehouse);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Almacén actualizado correctamente" : "Almacén creado correctamente",
                    "success"
                );
                resetForm();
                await fetchWarehouses();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar la alamcén", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar almacén" : "Crear almacén"}</DialogTitle>
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
                                name="address"
                                label="Dirección"
                                register={register}
                                error={errors.address}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                            <Controller
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
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={close}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Guardando..."
                                    : isEditing
                                        ? "Actualizar almacén"
                                        : "Guardar almacén"}
                            </Button>
                        </div>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}