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

/** Venta mínima necesaria para decidir si un pago cuenta como movimiento de caja. */
export interface CashSessionRelatedSale {
    id?: string;
    status?: string;
    sale_type?: string;
    total?: number | string | null;
}

export interface CashSessionSalePayment {
    id: string;
    payment_account_id: string | null;
    cash_session_id?: string | null;
    payment_date: string | null;
    amount: number | string | null;
    amount_base: number | string | null;
    payment_method?: string | null;
    payment_accounts?: CashSessionPaymentAccount | null;
    sales?: CashSessionRelatedSale | null;
}

export interface CashSessionReceivablePayment {
    id: string;
    payment_account_id: string | null;
    cash_session_id?: string | null;
    payment_date: string | null;
    amount: number | string | null;
    amount_base: number | string | null;
    reversed_at?: string | null;
    payment_accounts?: CashSessionPaymentAccount | null;
    receivables?: { sales?: CashSessionRelatedSale | null } | null;
}

export type CashSessionMovementType = "sale_payment" | "receivable_payment";

/** Movimiento conciliable de la sesión, normalizado para la UI. */
export interface CashSessionMovement {
    id: string;
    type: CashSessionMovementType;
    payment_account_id: string;
    payment_account_name: string;
    payment_date: string | null;
    amount: number;
    description: string;
}

/** Saldo calculado por cuenta: apertura + movimientos = esperado. */
export interface CashSessionAccountSummary {
    payment_account_id: string;
    payment_account_name: string;
    opening_amount: number;
    collected_amount: number;
    expected_amount: number;
    declared_amount: number | null;
    difference: number | null;
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
    sale_payments?: CashSessionSalePayment[];
    receivable_payments?: CashSessionReceivablePayment[];
}

export interface CashboxQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    warehouse_id?: string;
    company_id?: string;
}
