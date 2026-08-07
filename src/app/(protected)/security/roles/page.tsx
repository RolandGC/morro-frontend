"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/modules/security/roles/components/DataTable";
import { roleService } from "@/modules/security/roles/services/role.service";
import { useRoleStore } from "@/modules/security/roles/store/role.store";
import { Role } from "@/modules/security/roles/types/roles.types";
import { getColumns } from "./columns";
import { useEffect, useState } from "react";
import RoleFormModal from "@/modules/security/roles/components/RoleFormModal";
import { Spinner } from "@/components/Spinner";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { RequirePermission } from "@/components/RequirePermission";

export default function RolesPage() {
    const { isLoading } = useProtectedRoute('roles.read');
    const { openCreate, close } = useRoleStore();
    const [data, setData] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);


    const fetchRoles = async () => {
        try {
            setLoading(true);

            const response = await roleService.getAll();

            if (response.status === 200) {
                setData(response.data);
            } else {
                console.error("Error fetching roles:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchRoles();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, []);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <RequirePermission permission="roles.read" fallback={null}>
            <div className="container mx-auto py-4 px-2">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">Roles</h1>
                    <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Rol</Button>
                </div>
                {loading ? (
                    <Spinner />
                ) : (
                    <DataTable
                        columns={getColumns({ fetchRoles })}
                        data={data}
                    />
                )}
                <RoleFormModal onSuccess={() => close()} fetchData={fetchRoles} />
            </div>
        </RequirePermission>
    )
}