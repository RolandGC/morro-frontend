import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { APIS_PERU_BASE_URL, APIS_PERU_TOKEN } from "@/config/environment";
import { useToast } from "@/hooks/useToast";
import { useSupplierStore } from "../store/supplier.store";
import { SupplierForm, supplierSchema } from "../validators/supplierSchema";
import { supplierService } from "../services/supplier.service";
import SimpleSelector from "@/components/SimpleSelector";
import { Company } from "@/modules/core/companies/types/company.type";
import { companyService } from "@/modules/core/companies/services/company.service";

interface SupplierFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
export default function SupplierFormModal({ onSuccess, fetchData }: SupplierFormProps) {
    const { isEditing, supplier, open, close, supplier_id } = useSupplierStore();
    const [isSearch, setIsSearch] = useState(false)
    const defaultValues = supplier;
    const { notify: showToast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);


    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<SupplierForm>({
        resolver: zodResolver(supplierSchema),
        defaultValues: supplier,
    });

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

    useEffect(() => {
        if (isEditing && supplier) {
            resetForm({
                name: supplier.name ?? "",
                company_id: supplier.company_id ?? "",
                email: supplier.email ?? "",
                phone: supplier.phone ?? "",
                ruc: supplier.ruc ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [supplier, isEditing, resetForm]);

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

            //setValue("address", data.direccion, { shouldValidate: true });
            showToast("Datos del RUC cargados correctamente", "success");
        } catch (error) {
            console.error(error);
            showToast("No se pudo consultar el RUC", "error");
        } finally {
            setIsSearch(false);
        }
    };

    const onSubmit = async (supplier: SupplierForm) => {
        console.log("holaaa")
        try {
            let response;
            if (isEditing && supplier_id) {
                response = await supplierService.update(supplier_id, supplier);
            } else {
                response = await supplierService.create(supplier);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Empresa actualizado correctamente" : "Empresa creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar el provedor", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar proveedor" : "Crear proveedor"}</DialogTitle>
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
                                name="email"
                                label="Correo"
                                register={register}
                                error={errors.email}
                            />
                            <InputText
                                name="phone"
                                label="Celular"
                                register={register}
                                error={errors.phone}
                            />
                        </div>
                        <Controller
                            name="company_id"
                            control={control}
                            render={({ field }) => (
                                <SimpleSelector
                                    label="Asociar a una empresa"
                                    value={field.value}
                                    options={companies.map((company) => ({
                                        id: company.id,
                                        name: company.name,
                                    }))}
                                    onSelect={field.onChange}
                                    error={errors.company_id}
                                />
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar proveedor"
                                    : "Guardar proveedor"}
                        </Button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}