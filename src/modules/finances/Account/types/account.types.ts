import { payment_account_type } from "@/types/types";

export interface Account {
    id: string;
    company_id: string;
    name: string;
    type: payment_account_type;
    account_number: string;
    bank_name: string;
    currency_id: string;
    is_active: true
}
export interface AccountQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    company_id?: string | undefined;
    name?: string | undefined;
    type?: payment_account_type;
    currency_id?: string | undefined;
    is_active?: boolean | undefined;
}
