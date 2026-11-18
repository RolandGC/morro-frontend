export interface StockComparisonsQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    company_id?: string | undefined;
    warehouse_id?: string | undefined;
    created_by?: string | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}


export interface StockComparison {
    
    unit_cost: number;
}
