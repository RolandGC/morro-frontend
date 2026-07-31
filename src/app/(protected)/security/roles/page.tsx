"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/modules/security/roles/components/DataTable";
import { roleService } from "@/modules/security/roles/services/role.service";
import { useRoleStore } from "@/modules/security/roles/store/role.store";
import { Role } from "@/modules/security/roles/types/roles.types";
import { getColumns } from "./columns";
import { useEffect, useState } from "react";
import RoleFormModal from "@/modules/security/roles/components/RoleFormModal";

export default function RolesPage() {
    const { openCreate, role } = useRoleStore();
    const [data, setData] = useState<Role[]>([]);


    const fetchRoles = async () => {
        const response = await roleService.getAll();
        if (response.status === 200) {
            console.log(response.data, "okkkk")
            setData(response.data);
        } else {
            console.error("Error fetching companies:", response.statusText);
        }
    };
    useEffect(() => {
        try {
            fetchRoles();
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    }, []);

    return (
        <div className="container mx-auto py-4 px-2">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Roles</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Rol</Button>
            </div>
            <DataTable
                columns={getColumns({ fetchRoles })}
                data={data}
            />
            <RoleFormModal onSuccess={() => close()} fetchData={fetchRoles}/>
        </div>
    )
}