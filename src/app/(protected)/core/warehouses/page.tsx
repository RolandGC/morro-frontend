"use client"

import { Button } from "@/components/ui/button"
import { WarehouseDataTable } from "@/modules/core/warehouses/components/WarehouseDataTable"
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service"
import { Warehouse, WarehouseQueryParams } from "@/modules/core/warehouses/types/warehouse.types"
import { PaginationMeta } from "@/types/types"
import { useEffect, useState } from "react"
import { getColumns } from "./columns"
import { useWarehouseStore } from "@/modules/core/warehouses/store/warehouse.store"
import WarehouseFormModal from "@/modules/core/warehouses/components/WarehouseFormModal"
import { Spinner } from "@/components/Spinner"
import { RequirePermission } from "@/components/RequirePermission"

export default function WarehousesPage() {
    const [data, setData] = useState<Warehouse[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const { openCreate } = useWarehouseStore();

    const [warehouseFilter, setWarehouseFilter] = useState<WarehouseQueryParams>({
        name: '',
        is_active: true,
        company_id: undefined,
        page: 1,
        limit: 10,
        address: undefined,
        type: undefined,
    });

    const handleFilter = <K extends keyof WarehouseQueryParams>(
        key: K,
        value: WarehouseQueryParams[K]
    ) => {
        setWarehouseFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchWarehouses = async () => {
        const isInitial = loading;

        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setFilterLoading(true);
            }
            const response = await warehouseService.getAll(warehouseFilter);
            if (response.status === 200) {
                setData(response.data.data)
                setPages(response.data.meta)
            }
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setFilterLoading(false);
            }
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWarehouses();
        }, 350);

        return () => clearTimeout(timer);
    }, [warehouseFilter?.name, warehouseFilter?.page])

    if (loading) {
        return (
            <div className="container mx-auto py-4 px-2">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold dark:text-yellow-300">Almacenes</h1>
                <RequirePermission permission="warehouses.create">
                    <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Almacén</Button>
                </RequirePermission>
            </div>

            <WarehouseDataTable
                filter={warehouseFilter}
                columns={getColumns({ fetchWarehouses })}
                data={data}
                totalPages={pages?.totalPages ?? 1}
                handleFilter={handleFilter}
            />
            <WarehouseFormModal
                fetchWarehouses={fetchWarehouses}
                onSuccess={() => close()}
            />

        </div>
    )
}