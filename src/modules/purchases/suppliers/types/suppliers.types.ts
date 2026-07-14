export interface Supplier{
    id: string;
    name: string;
    ruc: string;
    phone: string;
    email: string;
    company_id: string;
}


export interface SupplierQueryParams {
    page?: number; // default: 1
    limit?: number; // default: 20
    name?: string;
    company_id?: string;
    ruc?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
}