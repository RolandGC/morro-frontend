
export interface WarehouseQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    name?: string | undefined;
    company_id?: string | undefined;
    type?: string | undefined;
    address?: string | undefined;
    is_active?: boolean | undefined;
    created_at?: string | undefined;
}