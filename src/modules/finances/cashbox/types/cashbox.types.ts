export interface Cashbox {
    id: string;
    warehouse_id: string;
    company_id: string;
    notes: string;
}
export interface CashboxQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    warehouse_id?: string;
    company_id?: string;
}
