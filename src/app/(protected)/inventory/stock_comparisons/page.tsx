"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { RequirePermission } from "@/components/RequirePermission";
import { SectionCard } from "@/components/section-card";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useToast } from "@/hooks/useToast";
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service";
import type { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { userService } from "@/modules/core/user/services/user.service";
import type { User } from "@/modules/core/user/types/user.types";
import { productService } from "@/modules/inventory/products/services/product.service";
import type { Product } from "@/modules/inventory/products/types/produc.type";
import { StockComparisonDataTable } from "@/modules/inventory/stockComparisons/components/StockComparisonDataTable";
import StockComparisonDetailModal from "@/modules/inventory/stockComparisons/components/StockComparisonDetailModal";
import StockComparisonFormModal from "@/modules/inventory/stockComparisons/components/StockComparisonFormModal";
import { stockComparisonsService } from "@/modules/inventory/stockComparisons/services/stockComparisons.service";
import { useStockComparisonStore } from "@/modules/inventory/stockComparisons/store/stockComparison.store";
import type {
    StockComparison,
    StockComparisonsQueryParams,
} from "@/modules/inventory/stockComparisons/types/stockComparisons.type";
import type { PaginationMeta } from "@/types/types";

import { getColumns } from "./columns";

export default function StockComparisonsPage() {
    const { isLoading: routeLoading } =
        useProtectedRoute("stock-comparisons.read");
    const { openCreate } = useStockComparisonStore();
    const { notify } = useToast();

    const [data, setData] = useState<StockComparison[]>([]);
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const initialLoad = useRef(true);

    const [filter, setFilter] = useState<StockComparisonsQueryParams>({
        page: 1,
        limit: 10,
        warehouse_id: undefined,
        created_by: undefined,
        date_from: undefined,
        date_to: undefined,
    });

    const handleFilter = <K extends keyof StockComparisonsQueryParams>(
        key: K,
        value: StockComparisonsQueryParams[K]
    ) => {
        setFilter((previous) => ({
            ...previous,
            [key]: value,
            ...(key === "page" ? {} : { page: 1 }),
        }));
    };

    const fetchData = useCallback(async () => {
        const isInitial = initialLoad.current;

        if (isInitial) setLoading(true);
        else setFilterLoading(true);

        try {
            const response = await stockComparisonsService.getAll(filter);

            if (response.status !== 200) {
                throw new Error("Respuesta inesperada al listar comparaciones");
            }

            setData(response.data.data);
            setPages(response.data.meta);
        } catch (error) {
            console.error("Error cargando comparaciones de stock:", error);
            notify("No se pudieron cargar las comparaciones de stock", "error");
        } finally {
            initialLoad.current = false;
            if (isInitial) setLoading(false);
            else setFilterLoading(false);
        }
    }, [filter, notify]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchData();
        }, 350);

        return () => clearTimeout(timer);
    }, [fetchData]);

    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const [warehouseResponse, userResponse, productResponse] =
                    await Promise.all([
                        warehouseService.getAll({
                            is_active: true,
                            limit: 100,
                        }),
                        userService.getAll({ is_active: true, limit: 100 }),
                        productService.getAll({ is_active: true, limit: 100 }),
                    ]);

                if (warehouseResponse.status === 200) {
                    setWarehouses(warehouseResponse.data.data);
                }

                if (userResponse.status === 200) {
                    setUsers(userResponse.data.data);
                }

                if (productResponse.status === 200) {
                    setProducts(productResponse.data.data);
                }
            } catch (error) {
                console.error("Error cargando catálogos de comparación:", error);
                notify("No se pudieron cargar almacenes, usuarios y productos", "error");
            }
        };

        void loadCatalogs();
    }, [notify]);

    if (loading || routeLoading) {
        return (
            <div className="container mx-auto px-4 py-4">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-4 px-4 py-6">
            <PageHeader
                title="Comparación de stock"
                description="Registra y revisa auditorías físicas por almacén, producto y unidad de medida."
                icon={ClipboardList}
                actions={
                    <RequirePermission permission="stock-comparisons.create">
                        <Button onClick={openCreate}>
                            <Plus className="mr-1.5 size-4" />
                            Nueva comparación
                        </Button>
                    </RequirePermission>
                }
            />

            <SectionCard
                title="Comparaciones registradas"
                description="El conteo físico no modifica el stock del sistema."
                badge={
                    filterLoading ? (
                        <span className="text-xs text-muted-foreground">
                            Actualizando...
                        </span>
                    ) : null
                }
            >
                <StockComparisonDataTable
                    columns={getColumns()}
                    data={data}
                    filter={filter}
                    handleFilter={handleFilter}
                    totalPages={pages?.totalPages ?? 1}
                    totalRecords={pages?.total ?? 0}
                    warehouseOptions={warehouses.map((warehouse) => ({
                        id: warehouse.id,
                        name: warehouse.name,
                    }))}
                    userOptions={users.map((user) => ({
                        id: user.id,
                        name: [user.name, user.last_name]
                            .filter(Boolean)
                            .join(" ") || user.email,
                    }))}
                    isFiltering={filterLoading}
                />
            </SectionCard>

            <StockComparisonFormModal
                fetchData={fetchData}
                warehouses={warehouses}
                products={products}
            />
            <StockComparisonDetailModal />
        </div>
    );
}
