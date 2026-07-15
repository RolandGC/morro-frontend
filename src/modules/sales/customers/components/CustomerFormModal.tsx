import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { useCustomerStore } from "../store/customer.store";
import { CustomerForm, customerSchema } from "../validators/customerSchema";
import { customerService } from "../services/customer.service";
import { APIS_PERU_BASE_URL, APIS_PERU_TOKEN } from "@/config/environment";
import { doc_type } from "@/types/types";

interface CustomerFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
const booleanOptions = [
    { id: "1", name: "Sí", value: true },
    { id: "2", name: "No", value: false },
];

export default function CustomerFormModal({ onSuccess, fetchData }: CustomerFormProps) {
    const { isEditing, customer, open, close, customer_id } = useCustomerStore();
    const defaultValues = customer;
    const { notify: showToast } = useToast();
    const [isSearchingDni, setIsSearchingDni] = useState(false);

    const docTypes = [
        { id: "1", name: "DNI", value: doc_type.dni },
        { id: "2", name: "Ruc", value: doc_type.ruc },
        { id: "3", name: "Carné Extranjería", value: doc_type.ce },
    ];
    const { register, handleSubmit,
        control, reset: resetForm,
        getValues,
        setValue,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer,
    });

    const searchDni = async () => {
        const docNumber = getValues("doc_number")?.trim();

        if (!docNumber || docNumber.length !== 8) {
            showToast("Ingrese un DNI válido de 8 dígitos", "warning");
            return;
        }

        setIsSearchingDni(true);
        try {
            const response = await fetch(
                `${APIS_PERU_BASE_URL}/dni/${docNumber}?token=${APIS_PERU_TOKEN}`
            );

            if (!response.ok) {
                throw new Error("Error al consultar DNI");
            }

            const data = await response.json();
            const fullName = [data.nombres, data.apellidoPaterno, data.apellidoMaterno]
                .filter(Boolean)
                .join(" ");

            //setValue("name", data.nombres ?? "", { shouldValidate: true });
            setValue("full_name", fullName, { shouldValidate: true });
            showToast("Datos del DNI cargados correctamente", "success");
        } catch (error) {
            console.error(error);
            showToast("No se pudo consultar el DNI", "error");
        } finally {
            setIsSearchingDni(false);
        }
    };

    useEffect(() => {
        if (isEditing && customer) {
            resetForm({
                full_name: customer.full_name ?? "",
                doc_number: customer.doc_number,
                address: customer.address ?? "",
                email: customer.email ?? "",
                phone: customer.phone ?? "",
                credit_balance: customer.credit_balance ?? "",
                credit_limit: customer.credit_limit ?? "",
                doc_type: customer.doc_type ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [customer, isEditing, resetForm]);

    const onSubmit = async (customer: CustomerForm) => {
        try {
            let response;
            if (isEditing && customer_id) {
                response = await customerService.update(customer_id, customer);
            } else {
                response = await customerService.create(customer);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Cleinte actualizado correctamente" : "Cliente creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar el cliente", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar Cliente" : "Crear Cliente"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                            <InputText
                                name="doc_number"
                                label="DNI"
                                register={register}
                                error={errors.doc_number}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={searchDni}
                                disabled={isSearchingDni}
                            >
                                {isSearchingDni ? "Buscando..." : "Buscar"}
                            </Button>
                        </div>
                        <div>
                            <InputText
                                name="full_name"
                                label="Nombre"
                                register={register}
                                error={errors.full_name}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="address"
                                label="Dirección"
                                register={register}
                                error={errors.address}
                            />
                            <Controller
                                name="doc_type"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Tipo de documento"
                                        value={docTypes.find((r) => r.value === field.value)?.id}
                                        options={docTypes}
                                        onSelect={(id) => {
                                            const selected = docTypes.find((r) => r.id === id);
                                            field.onChange(selected?.value ?? regime.general);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="email"
                                label="Correo electrónico"
                                type="email"
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


                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar cliente"
                                    : "Guardar cliente"}
                        </Button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}