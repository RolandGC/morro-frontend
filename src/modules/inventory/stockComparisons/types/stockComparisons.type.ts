import type { User } from "@/modules/core/user/types/user.types";
import type { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import type {
    Product,
    ProductUnit,
} from "@/modules/inventory/products/types/produc.type";

export type StockComparisonStatus =
    | "ok"
    | "surplus"
    | "shortage"
    | "not_tracked";

export interface StockComparisonsQueryParams {
    page?: number;
    limit?: number;
    company_id?: string;
    warehouse_id?: string;
    created_by?: string;
    date_from?: string;
    date_to?: string;
}

/**
 * Ítem guardado por el backend. Los campos decimales de Prisma pueden
 * serializarse como número o como string, por eso se tipan como unión.
 */
export interface StockComparisonItem {
    id: string;
    comparison_id: string;
    product_id: string;
    product_unit_id: string;
    product_name: string | null;
    product_model: string | null;
    unit_name: string | null;
    conversion_factor: number | string;
    track_stock: boolean;
    system_quantity: number | string;
    counted_quantity: number | string;
    counted_base_quantity: number | string;
    difference_base: number | string;
    status: StockComparisonStatus;
    created_at: string;
    products?: Product | null;
    product_units?: ProductUnit | null;
}

export interface StockComparison {
    id: string;
    company_id: string;
    warehouse_id: string;
    created_by: string;
    created_at: string;
    reason: string | null;
    items_count: number;
    differences_count: number;
    surplus_quantity: number | string;
    shortage_quantity: number | string;
    warehouses?: Warehouse | null;
    users?: User | null;
    stock_comparison_items?: StockComparisonItem[];
}
