"use client"

import { SupplierDataTable } from "@/modules/purchases/suppliers/components/SupplierDataTable"
import { getColumns } from "./columns"
import { Supplier, SupplierQueryParams } from "@/modules/purchases/suppliers/types/suppliers.types"
import { useEffect, useState } from "react"
import { PaginationMeta } from "@/types/types"
import { supplierService } from "@/modules/purchases/suppliers/services/supplier.service"
import { Button } from "@/components/ui/button"
import { useSupplierStore } from "@/modules/purchases/suppliers/store/supplier.store"
import SupplierFormModal from "@/modules/purchases/suppliers/components/SupplierFormModal"
import { Spinner } from "@/components/Spinner"

export default function SupplierPage() {
    const [data, setData] = useState<Supplier[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const { openCreate } = useSupplierStore()

    const [supplierFilter, setSupplierFilter] = useState<SupplierQueryParams>({
        name: '',
        is_active: true,
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof SupplierQueryParams>(
        key: K,
        value: SupplierQueryParams[K]
    ) => {
        setSupplierFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchData = async () => {
        const isInitial = loading;

        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setFilterLoading(true);
            }
            const response = await supplierService.getAll(supplierFilter)
            if (response.status === 200) {
                setData(response.data.data)
                setPages(response.data.meta)
            } else {
                console.error("Error fetching suppliers:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching suppliers:", error);
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
            fetchData();
        }, 350);

        return () => clearTimeout(timer);
    }, [supplierFilter?.name, supplierFilter?.page])

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
                <h1 className="text-2xl font-bold">Proveedores</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Proveedor</Button>
            </div>

            <SupplierDataTable
                columns={getColumns({ fetchData })}
                data={data}
                filter={supplierFilter}
                handleFilter={handleFilter}
                totalPages={pages?.totalPages ?? 1}
            />
            <SupplierFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />

        </div>
    )
}