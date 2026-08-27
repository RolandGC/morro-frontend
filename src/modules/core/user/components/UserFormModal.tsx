"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { APIS_PERU_BASE_URL, APIS_PERU_TOKEN } from "@/config/environment";
import { useToast } from "@/hooks/useToast";
import { companyService } from "@/modules/core/companies/services/company.service";
import { Company } from "@/modules/core/companies/types/company.type";
import { useUserStore } from "../store/user.store";
import { userService } from "../services/user.service";
import { UserForm, userSchema, } from "../validators/userSchema";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Role } from "@/modules/security/roles/types/roles.types";
import { roleService } from "@/modules/security/roles/services/role.service";

interface UserFormProps {
    onSuccess?: () => void;
    fetchUsers: () => void;
}

const booleanOptions = [
    { id: "1", name: "Sí", value: true },
    { id: "2", name: "No", value: false },
];

export default function ModalUserForm({ onSuccess, fetchUsers }: UserFormProps) {
    const { user, isEditing, user_id, open, close } = useUserStore();
    const { notify: showToast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [roles, setRules] = useState<Role[]>([])
    const [isSearchingDni, setIsSearchingDni] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset: resetForm,
        setValue,
        getValues,
        formState: { errors, isSubmitting, },
        setError,
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: user,
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await companyService.getAllCompanies();
                if (response.status === 200) {
                    setCompanies(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        const fetchRoles = async () => {
            try {
                const response = await roleService.getAll();
                if (response.status === 200) {
                    setRules(response.data);
                }
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles()

        fetchCompanies();
    }, []);

    useEffect(() => {
        if (!open) {
            resetForm(user);
            return;
        }

        if (isEditing) {
            resetForm({
                name: user.name ?? "",
                last_name: user.last_name ?? "",
                email: user.email ?? "",
                doc_number: user.doc_number ?? "",
                password: "",
                company_ids: user.company_ids ?? [],
                role_ids: user.role_ids ?? [],
                is_superadmin: user.is_superadmin ?? false,
                is_active: user.is_active ?? true,
            });
        } else {
            resetForm(user);
        }
    }, [open, isEditing, user, resetForm]);

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
            const fullName = [data.apellidoPaterno, data.apellidoMaterno]
                .filter(Boolean)
                .join(" ");

            setValue("name", data.nombres ?? "", { shouldValidate: true });
            setValue("last_name", fullName, { shouldValidate: true });
            showToast("Datos del DNI cargados correctamente", "success");
        } catch (error) {
            console.error(error);
            showToast("No se pudo consultar el DNI", "error");
        } finally {
            setIsSearchingDni(false);
        }
    };

    const onSubmit = async (formData: UserForm) => {
        if (!isEditing && (!formData.password || formData.password.length < 8)) {
            showToast("La contraseña debe tener al menos 8 caracteres", "error");
            return;
        }

        try {
            let response;
            if (isEditing && user_id) {
                const payload: Partial<UserForm> = { ...formData };

                if (!payload.password) {
                    delete payload.password;
                }

                response = await userService.update(user_id, payload);

            } else {
                const { is_active: _, ...createData } = formData;
                response = await userService.create(
                    createData as UserForm
                );
            }

            if (response.status === 201 || response.status === 200) {
                showToast("Usuario creado correctamente", "success");
                resetForm();
                await fetchUsers();
                close(),
                    onSuccess?.();
            }

        } catch (error) {
            showToast("Error al guardar el usuario", "error");
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data?.message)
                setError("email", {
                    message: error.response?.data?.message
                })
            }
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar usuario" : "Crear usuario"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form
                        key={isEditing ? `edit-${user_id}` : "create"}
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 w-full"
                    >
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="name"
                                label="Nombre"
                                register={register}
                                error={errors.name}
                            />
                            <InputText
                                name="last_name"
                                label="Apellidos"
                                register={register}
                                error={errors.last_name}
                            />
                        </div>

                        <InputText
                            name="email"
                            label="Correo electrónico"
                            type="email"
                            register={register}
                            error={errors.email}
                        />

                        <InputText
                            name="password"
                            label={
                                isEditing
                                    ? "Contraseña (dejar vacío para no cambiar)"
                                    : "Contraseña"
                            }
                            type="password"
                            register={register}
                            error={errors.password}
                        />

                        <Controller
                            name="company_ids"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-col gap-2">
                                    <label>Empresas</label>
                                    <div className="flex flex-col gap-2 rounded-md border p-3 max-h-40 overflow-y-auto">
                                        {companies.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No hay empresas disponibles
                                            </p>
                                        ) : (
                                            companies.map((company) => (
                                                <label
                                                    key={company.id}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={field.value.includes(
                                                            company.id
                                                        )}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([
                                                                    ...field.value,
                                                                    company.id,
                                                                ]);
                                                            } else {
                                                                field.onChange(
                                                                    field.value.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            company.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">
                                                        {company.name}
                                                    </span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    {errors.company_ids && (
                                        <p className="text-[13px] text-red-500 px-2 -my-2">
                                            {errors.company_ids.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <Controller
                            name="role_ids"
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-col gap-2">
                                    <label>Roles</label>
                                    <div className="flex flex-col gap-2 rounded-md border p-3 max-h-40 overflow-y-auto">
                                        {roles.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No hay roles disponibles
                                            </p>
                                        ) : (
                                            roles.map((role) => (
                                                <label
                                                    key={role.id}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={field.value.includes(
                                                            role.id
                                                        )}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([
                                                                    ...field.value,
                                                                    role.id,
                                                                ]);
                                                            } else {
                                                                field.onChange(
                                                                    field.value.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            role.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">
                                                        {role.name}
                                                    </span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    {errors.role_ids && (
                                        <p className="text-[13px] text-red-500 px-2 -my-2">
                                            {errors.role_ids.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="is_superadmin"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Superadmin"
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
                                            field.onChange(selected?.value ?? false);
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
                                        ? "Actualizar usuario"
                                        : "Guardar usuario"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
