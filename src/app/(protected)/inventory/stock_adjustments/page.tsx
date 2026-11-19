"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { RequirePermission } from "@/components/RequirePermission";
import { SectionCard } from "@/components/section-card";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useToast } from "@/hooks/useToast";
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service";
import type { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { StockAdjustmentDataTable } from "@/modules/inventory/stockAdjustment/components/StockAdjustmentDataTable";
import StockAdjustmentDetailModal from "@/modules/inventory/stockAdjustment/components/StockAdjustmentDetailModal";
import StockAdjustmentFormModal from "@/modules/inventory/stockAdjustment/components/StockAdjustmentFormModal";
import { stockAdjustmentService } from "@/modules/inventory/stockAdjustment/services/stockAdjustment.service";
import { useStockAdjustmentStore } from "@/modules/inventory/stockAdjustment/store/stockAdjustment.store";
import type {
    StockAdjustment,
    StockAdjustmentQueryParams,
} from "@/modules/inventory/stockAdjustment/types/stockAdjustment.type";
import type { PaginationMeta } from "@/types/types";

import { getColumns } from "./columns";

export default function StockAdjustmentsPage() {
    const { isLoading: routeLoading } =
        useProtectedRoute("stock-adjustments.read");
    const { openCreate } = useStockAdjustmentStore();
    const { notify } = useToast();

    const [data, setData] = useState<StockAdjustment[]>([]);
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    const initialLoad = useRef(true);

    const [filter, setFilter] = useState<StockAdjustmentQueryParams>({
        page: 1,
        limit: 10,
        warehouse_id: undefined,
        date_from: undefined,
        date_to: undefined,
    });

    const handleFilter = <K extends keyof StockAdjustmentQueryParams>(
        key: K,
        value: StockAdjustmentQueryParams[K]
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
            const response = await stockAdjustmentService.getAll(filter);

            if (response.status !== 200) {
                throw new Error("Respuesta inesperada al listar ajustes");
            }

            setData(response.data.data);
            setPages(response.data.meta);
        } catch (error) {
            console.error("Error cargando ajustes de stock:", error);
            notify("No se pudieron cargar los ajustes de stock", "error");
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
        const loadWarehouses = async () => {
            try {
                const response = await warehouseService.getAll({
                    is_active: true,
                    limit: 100,
                });

                if (response.status === 200) {
                    setWarehouses(response.data.data);
                }
            } catch (error) {
                console.error("Error cargando almacenes de ajustes:", error);
                notify("No se pudieron cargar los almacenes", "error");
            }
        };

        void loadWarehouses();
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
                title="Ajuste de stock"
                description="Registra entradas y salidas manuales de inventario por almacén, producto y unidad de medida."
                icon={SlidersHorizontal}
                actions={
                    <RequirePermission permission="stock-adjustments.create">
                        <Button onClick={openCreate}>
                            <Plus className="mr-1.5 size-4" />
                            Nuevo ajuste
                        </Button>
                    </RequirePermission>
                }
            />

            <SectionCard
                title="Ajustes registrados"
                description="Cada ajuste con movimiento genera su registro en kardex."
                badge={
                    filterLoading ? (
                        <span className="text-xs text-muted-foreground">
                            Actualizando...
                        </span>
                    ) : null
                }
            >
                <StockAdjustmentDataTable
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
                    isFiltering={filterLoading}
                />
            </SectionCard>

            <StockAdjustmentFormModal
                fetchData={fetchData}
                warehouses={warehouses}
            />
            <StockAdjustmentDetailModal />
        </div>
    );
}
