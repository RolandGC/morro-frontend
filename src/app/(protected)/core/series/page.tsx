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
import { getSelectedCompanyId } from "@/modules/reports/utils/company";
import SimpleSelector from "@/components/SimpleSelector";

export default function SeriesPage() {
    const { close, openCreate } = useSerieStore()
    const [data, setData] = useState<Serie[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);

    const [serieFilter, setSerieFilter] = useState<SerieQueryParams>({
        series: '',
        is_active: true,
        environment: "beta",
        company_id: getSelectedCompanyId() ?? undefined,
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
            ...(key === "page" ? {} : { page: 1 }),
        }));
    };

    const fetchData = async () => {
        const response = await serieService.getAll(serieFilter)
        if (response.status === 200) {
            setData(response.data.data)
            setPages(response.data.meta)

            if (!serieFilter.environment && response.data.meta.environment) {
                setSerieFilter((prev) => ({
                    ...prev,
                    environment: response.data.meta.environment ?? undefined,
                }))
            }
        } else {
            console.error("Error fetching series:", response.statusText);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 350);

        return () => clearTimeout(timer);
    }, [
        serieFilter?.series,
        serieFilter?.page,
        serieFilter?.company_id,
        serieFilter?.environment,
        serieFilter?.regime,
    ])

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-yellow-300">Series</h1>
                    <p className="text-sm text-muted-foreground">
                        Administra las series por empresa, ambiente y régimen.
                    </p>
                </div>
                <Button
                    onClick={() =>
                        openCreate(
                            serieFilter.environment === "all"
                                ? undefined
                                : serieFilter.environment
                        )
                    }
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                    Crear Serie
                </Button>
            </div>
            <SerieDataTable
                filter={serieFilter}
                columns={getColumns({ fetchData })}
                data={data}
                totalPages={pages?.totalPages ?? 1}
                handleFilter={handleFilter}
                toolbar={
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                        <div className="w-full sm:w-44">
                            <SimpleSelector
                                label="Ambiente"
                                value={serieFilter.environment}
                                options={[
                                    { id: "beta", name: "Beta" },
                                    { id: "produccion", name: "Producción" },
                                    { id: "all", name: "Todos" },
                                ]}
                                onSelect={(id) =>
                                    handleFilter(
                                        "environment",
                                        id === "beta" ||
                                            id === "produccion" ||
                                            id === "all"
                                            ? id
                                            : "beta"
                                    )
                                }
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <SimpleSelector
                                label="Régimen"
                                value={serieFilter.regime ?? "all"}
                                options={[
                                    { id: "all", name: "Todos" },
                                    { id: "general", name: "General" },
                                    { id: "zofra", name: "ZOFRA" },
                                ]}
                                onSelect={(id) =>
                                    handleFilter(
                                        "regime",
                                        id === "general" || id === "zofra"
                                            ? id
                                            : undefined
                                    )
                                }
                            />
                        </div>
                    </div>
                }
            />
            <SerieFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />

        </div>
    )
}