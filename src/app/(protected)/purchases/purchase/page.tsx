"use client"

import { getColumns } from "./columns"
import { useEffect, useState } from "react"
import { PaginationMeta, purchase_status } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Purchase, PurchaseQueryParams } from "@/modules/purchases/purchase/types/purchase.types"
import { purchaseService } from "@/modules/purchases/purchase/services/purchase.service"
import { PurchaseDataTable } from "@/modules/purchases/purchase/components/PurchaseDataTable"
import { usePurchaseStore } from "@/modules/purchases/purchase/store/purchase.store"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/Spinner"

export default function PurchasePage() {
    const [data, setData] = useState<Purchase[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const { openCreate } = usePurchaseStore()
    const router = useRouter();

    const [purchaseFilter, setPurchaseFilter] = useState<PurchaseQueryParams>({
        page: 1,
        limit: 10,
        //status: purchase_status,
    });

    const handleFilter = <K extends keyof PurchaseQueryParams>(
        key: K,
        value: PurchaseQueryParams[K]
    ) => {
        setPurchaseFilter((prev) => ({
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
            const response = await purchaseService.getAll(purchaseFilter)
            if (response.status === 200) {
                setData(response.data.data)
                setPages(response.data.meta)
            } else {
                console.error("Error fetching purchases:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching purchases:", error);
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
            void fetchData();
        }, 350);

        return () => clearTimeout(timer);
    }, [purchaseFilter?.date_to, purchaseFilter?.page]);

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
                <h1 className="text-2xl font-bold">Compras</h1>
                <Button onClick={() => router.push("/purchases/purchase/add")} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Agregar compra</Button>
            </div>

            <PurchaseDataTable
                columns={getColumns({ fetchData })}
                data={data}
                filter={purchaseFilter}
                handleFilter={handleFilter}
                totalPages={pages?.totalPages ?? 1}
            />
        </div>
    )
}