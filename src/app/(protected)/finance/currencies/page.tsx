"use client"

import { Button } from "@/components/ui/button"
import { CurrencyDataTable } from "@/modules/finances/currency/components/CurrencyDataTable";
import CurrencyFormModal from "@/modules/finances/currency/components/CurrencyFormModal";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { useCurrencyStore } from "@/modules/finances/currency/store/currency.store"
import { Currency, CurrencyQueryParams } from "@/modules/finances/currency/types/currency.types";
import { PaginationMeta } from "@/types/types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";

export default function CurrenciesPage() {
    const { close, openCreate } = useCurrencyStore()
    const [data, setData] = useState<Currency[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);

    const [currencyFilter, setCurrencyFilter] = useState<CurrencyQueryParams>({
        name: '',
        is_active: true,
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof CurrencyQueryParams>(
        key: K,
        value: CurrencyQueryParams[K]
    ) => {
        setCurrencyFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchData = async () => {
        const response = await currencyService.getAll(currencyFilter)
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
    }, [currencyFilter?.name, currencyFilter?.page])
    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold dark:text-yellow-300">Monedas</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear moneda</Button>
            </div>
            <CurrencyDataTable
                filter={currencyFilter}
                columns={getColumns({ fetchData })}
                data={data}
                totalPages={pages?.totalPages ?? 1}
                handleFilter={handleFilter}
            />
            <CurrencyFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />

        </div>
    )
}