import type { User } from "@/modules/core/user/types/user.types";
import type { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import type {
    Product,
    ProductUnit,
} from "@/modules/inventory/products/types/produc.type";

/**
 * El backend solo admite page, limit, company_id, warehouse_id,
 * date_from y date_to (QueryStockAdjustmentsDto). No hay filtro por
 * creador, producto ni texto libre.
 */
export interface StockAdjustmentQueryParams {
    page?: number;
    limit?: number;
    company_id?: string;
    warehouse_id?: string;
    date_from?: string;
    date_to?: string;
}

/**
 * Ítem persistido por el backend. Los decimales de Prisma pueden llegar
 * como número o como string, por eso se tipan como unión.
 */
export interface StockAdjustmentItem {
    id: string;
    adjustment_id: string;
    product_id: string;
    product_unit_id: string;
    quantity: number | string;
    unit_cost: number | string | null;
    base_quantity: number | string;
    created_at: string;
    products?: Product | null;
    product_units?: ProductUnit | null;
}

export interface StockAdjustment {
    id: string;
    company_id: string;
    warehouse_id: string;
    created_by: string | null;
    created_at: string;
    updated_at?: string | null;
    reason: string;
    warehouses?: Warehouse | null;
    users?: User | null;
    stock_adjustment_items?: StockAdjustmentItem[];
}
