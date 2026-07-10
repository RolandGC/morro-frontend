export interface Warehouse {
    id: string;
    company_id: string;
    name: string;
    type: string;
    address: string;
    is_active: boolean;
    created_at: string;
}

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