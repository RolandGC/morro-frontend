import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCompanyStore } from "../store/company.store";
import { Controller, useForm } from "react-hook-form";
import { CompanyForm, companySchema } from "../validators/companySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { APIS_PERU_BASE_URL, APIS_PERU_TOKEN } from "@/config/environment";
import { useToast } from "@/hooks/useToast";
import { companyService } from "../services/company.service";
import SimpleSelector from "@/components/SimpleSelector";
import { Warehouse } from "../../warehouses/types/warehouse.types";
import { warehouseService } from "../../warehouses/services/warehouse.service";

interface CompanyFormProps {
    onSuccess?: () => void;
    fetchCompanies: () => void,
}
export default function CompanyFormModal({ onSuccess, fetchCompanies }: CompanyFormProps) {
    const { isEditing, company, open, close, company_id } = useCompanyStore();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isSearch, setIsSearch] = useState(false)
    const defaultValues = company;
    const { notify: showToast } = useToast();

    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<CompanyForm>({
        resolver: zodResolver(companySchema),
        defaultValues: company,
    });

    useEffect(() => {
        if (isEditing && company) {
            resetForm({
                name: company.name ?? "",
                address: company.address ?? "",
                trade_name: company.trade_name ?? "",
                phone: company.phone ?? "",
                ruc: company.ruc ?? "",
                warehouse_id: company.warehouse_id ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [company, isEditing, resetForm]);

    useEffect(() => {
        const fetchwarehouses = async () => {
            try {
                const response = await warehouseService.getAll({ is_active: true });
                if (response.status === 200) {
                    setWarehouses(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching warehouses:', error);
            }

        };

        fetchwarehouses();
    }, [setWarehouses]);

    const searchRuc = async () => {
        const docNumber = getValues("ruc")?.trim();

        if (!docNumber || docNumber.length !== 11) {
            showToast("Ingrese un RUC válido de 11 dígitos", "warning");
            return;
        }

        setIsSearch(true);
        try {
            const response = await fetch(
                `${APIS_PERU_BASE_URL}/ruc/${docNumber}?token=${APIS_PERU_TOKEN}`
            );

            if (!response.ok) {
                throw new Error("Error al consultar RUC");
            }

            const data = await response.json();
            const fullName = [data.apellidoPaterno, data.apellidoMaterno]
                .filter(Boolean)
                .join(" ");

            setValue("name", data.razonSocial ?? "", { shouldValidate: true });
            setValue("address", data.direccion, { shouldValidate: true });
            showToast("Datos del RUC cargados correctamente", "success");
        } catch (error) {
            console.error(error);
            showToast("No se pudo consultar el RUC", "error");
        } finally {
            setIsSearch(false);
        }
    };

    const onSubmit = async (company: CompanyForm) => {
        try {
            let response;
            if (isEditing && company_id) {
                response = await companyService.update(company_id, company);
            } else {
                response = await companyService.create(company);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Empresa actualizado correctamente" : "Empresa creado correctamente",
                    "success"
                );
                resetForm();
                await fetchCompanies();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar la empresa", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar empresa" : "Crear Empresa"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                            <InputText
                                name="ruc"
                                label="RUC"
                                register={register}
                                error={errors.ruc}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={searchRuc}
                                disabled={isSearch}
                            >
                                {isSearch ? "Buscando..." : "Buscar"}
                            </Button>
                        </div>
                        <InputText
                            name="name"
                            label="Nombre"
                            register={register}
                            error={errors.name}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="trade_name"
                                label="Nombre Comercial"
                                register={register}
                                error={errors.trade_name}
                            />
                            <InputText
                                name="address"
                                label="Dirección"
                                register={register}
                                error={errors.address}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="phone"
                                label="Celular"
                                register={register}
                                error={errors.phone}
                            />
                            <Controller
                                name="warehouse_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Almacén"
                                        value={field.value}
                                        options={warehouses.map((warehouse) => ({
                                            id: warehouse.id,
                                            name: warehouse.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.warehouse_id}
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
                                        ? "Actualizar empresa"
                                        : "Guardar empresa"}
                            </Button>
                        </div>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}