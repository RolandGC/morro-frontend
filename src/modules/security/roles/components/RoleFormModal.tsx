import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { roleService } from "../services/role.service";
import { useRoleStore } from "../store/role.store";
import {
    permissionsSchema,
    RoleForm,
    RolePermissionsForm,
    roleSchema,
} from "../validators/rolesSchema";
import { Permission } from "../types/roles.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/Spinner";

interface RoleFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}

export default function RoleFormModal({ onSuccess, fetchData }: RoleFormProps) {
    const { isEditing, open, close, role, role_id } = useRoleStore();
    const { notify: showToast } = useToast();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);

    const createForm = useForm<RoleForm>({
        resolver: zodResolver(roleSchema),
        defaultValues: role,
    });

    const permissionsForm = useForm<RolePermissionsForm>({
        resolver: zodResolver(permissionsSchema),
        defaultValues: { permissions: [] },
        mode: "onChange",
    });

    const fetchPermissions = async () => {
        setLoadingPermissions(true);

        try {
            const response = await roleService.getPermissions();

            if (response.status === 200) {
                setPermissions(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchRole = async () => {
        setLoadingPermissions(true);

        try {
            const response = await roleService.getRoleById(role_id ?? "");

            if (response.status === 200) {
                const roleData = response.data;

                const currentPermissions = (roleData.role_permissions ?? []).map(
                    (rp: {
                        permission_id?: string;
                        permission_name?: string;
                        permission?: { name?: string };
                    }) => {
                        if (rp.permission?.name) return rp.permission.name;
                        if (rp.permission_name) return rp.permission_name;

                        if (rp.permission_id) {
                            const matchedPermission = permissions.find((permission) => permission.id === rp.permission_id);
                            return matchedPermission?.name ?? rp.permission_id;
                        }

                        return "";
                    }
                ).filter(Boolean);

                permissionsForm.reset({
                    permissions: currentPermissions,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPermissions(false);
        }
    };

    useEffect(() => {
        if (isEditing && role_id) {
            fetchRole();
        } else {
            permissionsForm.reset({ permissions: [] });
            createForm.reset({
                name: "",
                display_name: "",
                description: "",
            });
        }
    }, [role_id, isEditing]);

    const onCreateSubmit = async (roleData: RoleForm) => {
        try {
            const response = await roleService.create(roleData);

            if (response.status === 201 || response.status === 200) {
                showToast("Rol creado correctamente", "success");
                createForm.reset();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar el rol", "error");
            console.error(error);
        }
    };

    const onPermissionsSubmit = async (permissionsData: RolePermissionsForm) => {
        if (!role_id) return;

        try {
            const response = await roleService.updatePermissions(role_id, permissionsData.permissions);

            if (response.status === 201 || response.status === 200) {
                showToast("Permisos actualizados correctamente", "success");
                permissionsForm.reset({ permissions: permissionsData.permissions });
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al actualizar permisos", "error");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar Permisos" : "Crear Rol"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    {isEditing && loadingPermissions ? (
                        <div className="flex justify-center py-8">
                            <Spinner />
                        </div>
                    ) : (
                        <form
                            onSubmit={
                                isEditing
                                    ? permissionsForm.handleSubmit(onPermissionsSubmit)
                                    : createForm.handleSubmit(onCreateSubmit)
                            }
                            className="flex flex-col gap-4 w-full"
                        >
                            {!isEditing && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputText
                                            name="name"
                                            label="Clave"
                                            register={createForm.register}
                                            error={createForm.formState.errors.name}
                                        />
                                        <InputText
                                            name="display_name"
                                            label="Nombre"
                                            register={createForm.register}
                                            error={createForm.formState.errors.display_name}
                                        />
                                    </div>
                                    <InputText
                                        name="description"
                                        label="Descripción"
                                        register={createForm.register}
                                        error={createForm.formState.errors.description}
                                    />
                                </>
                            )}
                            {isEditing && (
                                <div>
                                    <Controller
                                        name="permissions"
                                        control={permissionsForm.control}
                                        defaultValue={[]}
                                        render={({ field }) => (
                                            <div className="grid grid-cols-2 gap-3">
                                                {permissions.map((permission) => {
                                                    const checked = field.value?.includes(permission.name);

                                                    return (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                checked={Boolean(checked)}
                                                                onCheckedChange={(value) => {
                                                                    const current = field.value ?? [];

                                                                    if (value) {
                                                                        field.onChange([...current, permission.name]);
                                                                    } else {
                                                                        field.onChange(
                                                                            current.filter((name: string) => name !== permission.name)
                                                                        );
                                                                    }
                                                                }}
                                                            />

                                                            <label className="text-sm">
                                                                {permission.display_name}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
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
                                    disabled={isEditing ? permissionsForm.formState.isSubmitting : createForm.formState.isSubmitting}
                                >
                                    {isEditing
                                        ? permissionsForm.formState.isSubmitting
                                            ? "Guardando..."
                                            : "Actualizar permisos"
                                        : createForm.formState.isSubmitting
                                            ? "Guardando..."
                                            : "Guardar Rol"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}