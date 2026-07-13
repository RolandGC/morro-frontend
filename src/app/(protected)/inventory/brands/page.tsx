'use client'

import { Button } from "@/components/ui/button";
import { BrandDataTable } from "@/modules/inventory/brands/components/BrandDataTable";
import { brandService } from "@/modules/inventory/brands/services/brands.service";
import { Brand, BrandQueryParams } from "@/modules/inventory/brands/types/brand.types";
import { PaginationMeta } from "@/types/types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { useBrandStore } from "@/modules/inventory/brands/store/brand.store";
import BrandFormModal from "@/modules/inventory/brands/components/BrandFormModal";

export default function BrandsPage() {
    const [data, setData] = useState<Brand[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const {brand, openCreate} = useBrandStore()

    const [brandFilter, setBrandFilter] = useState<BrandQueryParams>({
        name: '',
        is_active: true,
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof BrandQueryParams>(
        key: K,
        value: BrandQueryParams[K]
    ) => {
        setBrandFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const fetchBrands = async () => {
            const response = await brandService.getAll(brandFilter)
            if(response.status === 200){
                setData(response.data.data)
                setPages(response.data.meta)
            } else {
                console.error("Error fetching brands:", response.statusText);
            }
    }

    useEffect(()=>{
        try{
            fetchBrands();
        } catch (error){
            console.error("Error fetching brands:", error);
        }
    },[brandFilter?.name, brandFilter?.page])

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Marcas</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Marca</Button>
            </div>
            <BrandDataTable
                columns={getColumns({fetchBrands})}
                data={data}
                filter={brandFilter}
                handleFilter={handleFilter}
                totalPages={pages?.totalPages ?? 1}
            />
            <BrandFormModal
                fetchData={fetchBrands}
                onSuccess={() => close()}
            />
        </div>
    );
}