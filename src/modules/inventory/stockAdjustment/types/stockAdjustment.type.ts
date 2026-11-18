export interface StockAdjustmentQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    company_id?: string | undefined;
    warehouse_id?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}

export interface InventoryAdjustment {
    warehouse_id: string;
    reason: string;
    items: InventoryAdjustmentItem[];
}
export interface InventoryAdjustmentItem {
    product_id: string;
    product_unit_id: string;
    quantity: number;
    unit_cost: number;
}
