"use client"

import { getColumns } from "./columns"
import { useEffect, useState } from "react"
import { PaginationMeta, purchase_status } from "@/types/types"
import { Button } from "@/components/ui/button"
import { Purchase, PurchaseQueryParams } from "@/modules/purchases/purchase/types/purchase.types"
import { purchaseService } from "@/modules/purchases/purchase/services/purchase.service"
import { PurchaseDataTable } from "@/modules/purchases/purchase/components/PurchaseDataTable"
import PurchaseFormModal from "@/modules/purchases/purchase/components/PurchaseFormModal"
import { usePurchaseStore } from "@/modules/purchases/purchase/store/purchase.store"
import { useRouter } from "next/navigation"

export default function PurchasePage () {
    const [data, setData] = useState<Purchase[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const {openCreate} = usePurchaseStore()
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
        const response = await purchaseService.getAll(purchaseFilter)
        if (response.status === 200) {
            setData(response.data.data)
            setPages(response.data.meta)
        } else {
            console.error("Error fetching purchases:", response.statusText);
        }
    }

    useEffect(() => {
        try {
            fetchData();
        } catch (error) {
            console.error("Error fetching purchases:", error);
        }
    }, [purchaseFilter?.date_to, purchaseFilter?.page])
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
            <PurchaseFormModal
                fetchData={fetchData}
                onSuccess={()=> close()}
            />

        </div>
    )
}