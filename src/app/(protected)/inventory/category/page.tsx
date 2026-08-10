"use client"

import { Button } from "@/components/ui/button"
import { CategoryDataTable } from "@/modules/core/category/components/CategoryDataTable";
import { categoryService } from "@/modules/core/category/services/category.service";
import { useCategoryStore } from "@/modules/core/category/store/category.store";
import { Category, CategoryQueryParams } from "@/modules/core/category/types/category.types";
import { PaginationMeta } from "@/types/types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import CategoryFormModal from "@/modules/core/category/components/CategoryFormModal";
import { Spinner } from "@/components/Spinner";

export default function CategoryPage() {
    const [data, setData] = useState<Category[]>([])
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const { category, openCreate } = useCategoryStore()
    const [categoryFilter, setCategoryFilter] = useState<CategoryQueryParams>({
        name: '',
        is_active: true,
        page: 1,
        limit: 10,
    });

    const handleFilter = <K extends keyof CategoryQueryParams>(
        key: K,
        value: CategoryQueryParams[K]
    ) => {
        setCategoryFilter((prev) => ({
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
            const response = await categoryService.getAll(categoryFilter)
            if (response.status === 200) {
                setData(response.data.data)
                setPages(response.data.meta)
            } else {
                console.error("Error fetching categories:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
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
    }, [categoryFilter?.name, categoryFilter?.page])

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
                <h1 className="text-2xl font-bold dark:text-yellow-300">Categorías</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear Categoría</Button>
            </div>
            <CategoryDataTable
                filter={categoryFilter}
                columns={getColumns({ fetchData })}
                data={data}
                totalPages={pages?.totalPages ?? 1}
                handleFilter={handleFilter}
            />
            <CategoryFormModal
                fetchData={fetchData}
                onSuccess={() => close()}
            />
        </div>
    )
}