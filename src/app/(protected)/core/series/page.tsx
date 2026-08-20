"use client"

import { Button } from "@/components/ui/button"
import { SerieDataTable } from "@/modules/core/series/components/SerieDataTable";
import { Serie, SerieQueryParams } from "@/modules/core/series/types/serie.types";
import { PaginationMeta } from "@/types/types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { serieService } from "@/modules/core/series/services/serie.service";
import { useSerieStore } from "@/modules/core/series/store/serie.store";
import SerieFormModal from "@/modules/core/series/components/SerieFormModal";

export default function SeriesPage() {
    const { close, openCreate } = useSerieStore()
    const [data, setData] = useState<Serie[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);

    const [serieFilter, setSerieFilter] = useState<SerieQueryParams>({
        series: '',
        is_active: true,
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof SerieQueryParams>(
        key: K,
        value: SerieQueryParams[K]
    ) => {
        setSerieFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchData = async () => {
        const response = await serieService.getAll(serieFilter)
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
    }, [serieFilter?.series, serieFilter?.page])

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold dark:text-yellow-300">Series</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Serie</Button>
            </div>
            <SerieDataTable
                filter={serieFilter}
                columns={getColumns({ fetchData })}
                data={data}
                totalPages={pages?.totalPages ?? 1}
                handleFilter={handleFilter}
            />
            <SerieFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />

        </div>
    )
}