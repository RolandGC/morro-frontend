export interface PriceListQueryParams {
    page?: number; // default: 1
    limit?: number; // default: 20
    name?: string;
    company_id?: string;
    currency_id?: string;
    is_active?: boolean;
}