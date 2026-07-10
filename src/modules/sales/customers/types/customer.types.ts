export interface CustomerQueryParams {
    page?: number; // default: 1
    limit?: number; // default: 20
    full_name?: string;
    doc_type?: "dni" | "ruc" | "ce";
    doc_number?: string;
    phone?: string;
    email?: string;
    address?: string;
    credit_limit?: number;
    credit_balance?: number;
    is_active?: boolean;
}