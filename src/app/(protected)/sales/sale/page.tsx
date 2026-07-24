'use client';

import { Button } from "@/components/ui/button";
import { SaleDataTable } from "@/modules/sales/sale/components/PurchaseDataTable";
import { useRouter } from "next/navigation";
import { getColumns } from "./columns";
import { useEffect, useState } from "react";
import { saleService } from "@/modules/sales/sale/services/sale.service";
import { Sale, SaleQueryParams } from "@/modules/sales/sale/types/sale.types";
import { PaginationMeta } from "@/types/types";

export default function SalePage() {
    const router = useRouter();
    const [data, setData] = useState<Sale[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [saleFilter, setSaleFilter] = useState<SaleQueryParams>({
        page: 1,
        limit: 10,
        //status: sale_status,
    });

    const handleFilter = <K extends keyof SaleQueryParams>(
        key: K,
        value: SaleQueryParams[K]
    ) => {
        setSaleFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    const fetchData = async () => {
        const response = await saleService.getAll(saleFilter)
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
    }, [saleFilter?.date_to, saleFilter?.page])

    
    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Ventas</h1>
                <Button onClick={() => router.push("/sales/sale/add")} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Venta</Button>
            </div>
            <SaleDataTable
                columns={getColumns({ fetchData })}
                data={data}
                filter={saleFilter}
                handleFilter={handleFilter}
                totalPages={pages?.totalPages ?? 1}
            />
        </div>
    );
}