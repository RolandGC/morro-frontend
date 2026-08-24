"use client"

import { Button } from "@/components/ui/button"
import { PaginationMeta } from "@/types/types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { Account, AccountQueryParams } from "@/modules/finances/Account/types/account.types";
import { accountService } from "@/modules/finances/Account/services/account.service";
import AccountFormModal from "@/modules/finances/Account/components/AccountFormModal";
import { AccountDataTable } from "@/modules/finances/Account/components/AccountDataTable";
import { useAccountStore } from "@/modules/finances/Account/store/account.store";

export default function AccountPage() {
    const { close, openCreate } = useAccountStore()
    const [data, setData] = useState<Account[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);

    const [accountFilter, setAccountFilter] = useState<AccountQueryParams>({
        name: '',
        is_active: true,
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof AccountQueryParams>(
        key: K,
        value: AccountQueryParams[K]
    ) => {
        setAccountFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchData = async () => {
        const response = await accountService.getAll(accountFilter)
        if (response.status === 200) {
            setData(response.data.data)
            setPages(response.data.meta)
        } else {
            console.error("Error fetching series:", response.statusText);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 350);

        return () => clearTimeout(timer);
    }, [accountFilter?.name, accountFilter?.page])

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold dark:text-yellow-300">Bancos de pago</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Banco de pago</Button>
            </div>
            <AccountDataTable
                filter={accountFilter}
                columns={getColumns({ fetchData })}
                data={data}
                totalPages={pages?.totalPages ?? 1}
                handleFilter={handleFilter}
            />
            <AccountFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />
        </div>
    )
}