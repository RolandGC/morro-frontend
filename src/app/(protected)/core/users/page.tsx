'use client'

import { userService } from "@/modules/core/user/services/user.service";
import { User, UserQueryParams } from "@/modules/core/user/types/user.types";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "@/modules/core/user/components/data-table";
import { PaginationMeta } from "@/types/types";
import { useUserStore } from "@/modules/core/user/store/user.store";
import { Button } from "@/components/ui/button";
import { Modal } from "@/modules/core/user/components/Modal";

export default function UserPage() {
    const { openCreate, user } = useUserStore();
    const [data, setData] = useState<User[]>([]);
    const [pages, setPages] = useState<PaginationMeta | null>(null);

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
        try {
            const response = await userService.getAll(userFilter);
            if (response.status === 200) {
                setData(response.data.data);
                setPages(response.data.meta);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [userFilter?.name, userFilter?.page]);

    return (
        <div className="container mx-auto p-4">
            <h1  className="text-2xl font-bold dark:text-yellow-300">Usuarios</h1>
            <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear usuario</Button>
            <DataTable columns={columns} data={data} userFilter={userFilter} handleFilter={handleFilter} totalPages={pages?.totalPages ?? 1} />
            <Modal onSuccess={fetchUsers} />
        </div>
    );
}