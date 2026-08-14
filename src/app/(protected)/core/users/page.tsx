'use client'

import { userService } from "@/modules/core/user/services/user.service";
import { User, UserQueryParams } from "@/modules/core/user/types/user.types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { UserDataTable } from "@/modules/core/user/components/UserDataTable";
import { PaginationMeta } from "@/types/types";
import { useUserStore } from "@/modules/core/user/store/user.store";
import { Button } from "@/components/ui/button";
import UserFormModal from "@/modules/core/user/components/UserFormModal";
import { Spinner } from "@/components/Spinner";
import { RequirePermission } from "@/components/RequirePermission";

export default function UserPage() {
    const { openCreate, user } = useUserStore();
    const [data, setData] = useState<User[]>([]);
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);

    const [userFilter, setUserFilter] = useState<UserQueryParams>({
        name: '',
        email: '',
        is_active: true,
        company_id: undefined,
        page: 1,
        limit: 10,
        //order: "asc",
    });
    const handleFilter = <K extends keyof UserQueryParams>(
        key: K,
        value: UserQueryParams[K]
    ) => {
        setUserFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    const fetchUsers = async () => {
        const isInitial = loading;

        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setFilterLoading(true);
            }
            const response = await userService.getAll(userFilter);
            if (response.status === 200) {
                setData(response.data.data);
                setPages(response.data.meta);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setFilterLoading(false);
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 350);

        return () => clearTimeout(timer);
    }, [userFilter.name, userFilter.page]);

    if (loading) {
        return (
            <div className="container mx-auto py-4 px-2">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold dark:text-yellow-300">Usuarios</h1>
                <RequirePermission permission="users.create">
                    <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear usuario</Button>
                </RequirePermission>
            </div>
            <UserDataTable
                columns={getColumns({ fetchUsers })}
                data={data}
                userFilter={userFilter}
                handleFilter={handleFilter}
                totalPages={pages?.totalPages ?? 1}
            />
            <UserFormModal onSuccess={() => close()} fetchUsers={fetchUsers} />
        </div>
    );
}