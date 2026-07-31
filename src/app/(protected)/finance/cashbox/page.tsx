"use client"

import { Button } from "@/components/ui/button"
import { CashboxDataTable } from "@/modules/finances/cashbox/components/CashboxDataTable"
import { cashboxService } from "@/modules/finances/cashbox/services/cashbox.service";
import { Cashbox, CashboxQueryParams } from "@/modules/finances/cashbox/types/cashbox.types";
import { PaginationMeta } from "@/types/types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { useCashboxStore } from "@/modules/finances/cashbox/store/cashbox.store";

export default function CashboxPage() {
    const [data, setData] = useState<Cashbox[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const { openCreate } = useCashboxStore()
    const [cashboxFilter, setCashboxFilter] = useState<CashboxQueryParams>({
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof CashboxQueryParams>(
        key: K,
        value: CashboxQueryParams[K]
    ) => {
        setCashboxFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchData = async () => {
        const response = await cashboxService.getAll(cashboxFilter)
        if (response.status === 200) {
            setData(response.data.data)
            setPages(response.data.meta)
        } else {
            console.error("Error fetching currencies:", response.statusText);
        }
    }

    useEffect(() => {
        try {
            fetchData();
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    }, [cashboxFilter?.page])
    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold dark:text-yellow-300">Cierre de cajas</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear cierre</Button>
            </div>
            <CashboxDataTable
                filter={cashboxFilter}
                columns={getColumns({ fetchData })}
                data={data}
                totalPages={pages?.totalPages ?? 1}
                handleFilter={handleFilter}
            />
            {/* <CurrencyFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />
 */}
        </div>
    )
}