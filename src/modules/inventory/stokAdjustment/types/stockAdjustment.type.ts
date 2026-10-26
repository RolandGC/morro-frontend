export interface StockAdjustmentQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    company_id?: string | undefined;
    warehouse_id?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}