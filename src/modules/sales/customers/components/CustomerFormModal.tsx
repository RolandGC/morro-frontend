import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import axios from "axios";

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
    const [isSearchingDocument, setIsSearchingDocument] = useState(false);

    const docTypes = [
        { id: "1", name: "DNI", value: doc_type.dni },
        { id: "2", name: "RUC", value: doc_type.ruc },
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

    const searchDocument = async () => {
        const documentType = getValues("doc_type");
        const docNumber = getValues("doc_number")?.trim();

        if (!documentType) {
            showToast(
                "Seleccione un tipo de documento",
                "warning"
            );
            return;
        }

        if (!docNumber) {
            showToast(
                "Ingrese el número de documento",
                "warning"
            );
            return;
        }

        if (
            documentType === doc_type.dni &&
            !/^\d{8}$/.test(docNumber)
        ) {
            showToast(
                "El DNI debe tener 8 dígitos",
                "warning"
            );
            return;
        }

        if (
            documentType === doc_type.ruc &&
            !/^\d{11}$/.test(docNumber)
        ) {
            showToast(
                "El RUC debe tener 11 dígitos",
                "warning"
            );
            return;
        }

        setIsSearchingDocument(true);

        try {
            let url = "";

            switch (documentType) {
                case doc_type.dni:
                    url = `${APIS_PERU_BASE_URL}/dni/${docNumber}?token=${APIS_PERU_TOKEN}`;
                    break;

                case doc_type.ruc:
                    url = `${APIS_PERU_BASE_URL}/ruc/${docNumber}?token=${APIS_PERU_TOKEN}`;
                    break;

                case doc_type.ce:
                    url = `${APIS_PERU_BASE_URL}/ce/${docNumber}?token=${APIS_PERU_TOKEN}`;
                    break;

                default:
                    showToast(
                        "Tipo de documento no soportado",
                        "warning"
                    );
                    return;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Error HTTP: ${response.status}`
                );
            }

            const data = await response.json();

            if (documentType === doc_type.dni) {
                const fullName = [
                    data.nombres,
                    data.apellidoPaterno,
                    data.apellidoMaterno,
                ]
                    .filter(Boolean)
                    .join(" ");

                if (!fullName) {
                    showToast(
                        "No se encontraron datos para el DNI",
                        "warning"
                    );
                    return;
                }

                setValue(
                    "full_name",
                    fullName,
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );

                showToast(
                    "Datos del DNI cargados correctamente",
                    "success"
                );
            }

            if (documentType === doc_type.ruc) {
                setValue(
                    "full_name",
                    data.razonSocial ?? "",
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );

                setValue(
                    "address",
                    data.direccion ?? "",
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );

                if (!data.razonSocial) {
                    showToast(
                        "No se encontraron datos para el RUC",
                        "warning"
                    );
                    return;
                }

                showToast(
                    "Datos de la empresa cargados correctamente",
                    "success"
                );
            }

            if (documentType === doc_type.ce) {
                const fullName = [
                    data.nombres,
                    data.apellidoPaterno,
                    data.apellidoMaterno,
                ]
                    .filter(Boolean)
                    .join(" ");

                setValue(
                    "full_name",
                    fullName,
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );

                showToast(
                    "Datos del documento cargados correctamente",
                    "success"
                );
            }
        } catch (error) {
            console.error(
                "Error al consultar documento:",
                error
            );

            showToast(
                "No se pudo consultar el documento",
                "error"
            );
        } finally {
            setIsSearchingDocument(false);
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
            if (axios.isAxiosError(error)) {

                if (error.response?.status === 409) {
                    setError("doc_number", {
                        type: "backend",
                        message: error.response?.data?.message || "Ya existe un cliente con ese documento",
                    });
                    return;
                }
            } else {
                console.log('Error desconocido:', error);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
                    <DialogDescription>{isEditing ? "Modifica la información del cliente" : "Completa los datos para registrar un cliente"}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                            <div>
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
                                                field.onChange(selected?.value ?? "");
                                                setValue("doc_number", "");
                                                setValue("full_name", "");
                                                setValue("address", "");
                                            }}
                                            error={errors.doc_type}
                                        />
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-1">
                                <InputText
                                    name="doc_number"
                                    label="Número de documento"
                                    register={register}
                                    error={errors.doc_number}
                                    support="Se buscarán automáticamente"

                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={searchDocument}
                                    disabled={isSearchingDocument}
                                >
                                    {isSearchingDocument ? "Buscando..." : "Buscar"}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <InputText
                                name="full_name"
                                label="Nombre"
                                register={register}
                                error={errors.full_name}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <InputText
                                name="address"
                                label="Dirección"
                                register={register}
                                error={errors.address}
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
                                        ? "Actualizar cliente"
                                        : "Guardar cliente"}
                            </Button>
                        </div>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}