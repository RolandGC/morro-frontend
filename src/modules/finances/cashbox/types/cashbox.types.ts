import type { cash_session_status } from "@/types/types";

/** Cuenta de pago tal como viene incluida en las relaciones del backend. */
export interface CashSessionPaymentAccount {
    id: string;
    name?: string;
    type?: string;
    account_number?: string | null;
    currency_id?: string | null;
    is_active?: boolean;
}

/** Detalle real de `cash_session_details` (Decimal puede llegar como string). */
export interface CashSessionDetail {
    id: string;
    cash_session_id?: string | null;
    payment_account_id: string | null;
    opening_amount: number | string | null;
    declared_amount: number | string | null;
    difference: number | string | null;
    collected_amount: number | string | null;
    expected_amount: number | string | null;
    created_at?: string | null;
    updated_at?: string | null;
    payment_accounts?: CashSessionPaymentAccount | null;
}

export interface Cashbox {
    id: string;
    user_id: string | null;
    warehouse_id: string;
    company_id: string;
    status: cash_session_status | string;
    notes: string | null;
    opened_at: string | null;
    closed_at: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    users?: { id: string; name?: string; email?: string } | null;
    warehouses?: { id: string; name?: string } | null;
    companies?: { id: string; name?: string } | null;
    cash_session_details: CashSessionDetail[];
    sale_payments?: unknown[];
    receivable_payments?: unknown[];
}

export interface CashboxQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    warehouse_id?: string;
    company_id?: string;
}
