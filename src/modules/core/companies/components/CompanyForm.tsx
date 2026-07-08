import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useCompanyStore } from "../store/company.store";
import { useForm } from "react-hook-form";
import { CompanyForm, companySchema } from "../validators/companySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { APIS_PERU_BASE_URL, APIS_PERU_TOKEN } from "@/config/environment";
import { useToast } from "@/hooks/useToast";
import { companyService } from "../services/company.service";
import { is } from "zod/v4/locales";

interface CompanyFormProps {
    onSuccess?: () => void;
}
export default function CompanyFormModal({ onSuccess }: CompanyFormProps) {
    const { isEditing, company, open, close, company_id } = useCompanyStore();
    const [isSearch, setIsSearch] = useState(false)
    const defaultValues = company;
    const { notify: showToast } = useToast();


    const { register, handleSubmit,
        control, reset: resetForm,
        formState: { errors },
        getValues,
        setValue,
    } = useForm<CompanyForm>({
        resolver: zodResolver(companySchema),
        defaultValues: company,
    });

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
            if (isEditing && company_id) {
                const response = await companyService.update(company_id, company);
            }
            const response = await companyService.create(company);
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Empresa actualizado correctamente" : "Empresa creado correctamente",
                    "success"
                );
                resetForm();
                //resetStore();

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
                    <h1 className="font-bold text-2xl">{isEditing ? "Editar empresa" : "Crear Empresa"}</h1>
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
                            {/* <InputText
                                name="address"
                                label="Dirección"
                                register={register}
                                error={errors.address}
                            /> */}
                        </div>

                        <button type="submit">{isEditing ? "Actualizar Empresa" : "Guardar Empresa"}</button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}