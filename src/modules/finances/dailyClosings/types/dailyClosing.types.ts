import type { daily_closing_status } from "@/types/types";

export interface DailyClosingPaymentSummary {
    payment_account_name: string;
    count: number;
    total: number | string;
}

export interface DailyClosingSummary {
    total_sales_count?: number;
    total?: number | string;
    total_credit?: number | string;
    total_cash?: number | string;
    total_collected?: number | string;
    by_currency?: Record<string, { count: number; total: number | string }>;
    by_payment_method?: Record<string, { count: number; total: number | string }>;
    collections_by_payment_method?: Record<
        string,
        { count: number; total: number | string }
    >;
    payment_summary?: DailyClosingPaymentSummary[];
    [key: string]: unknown;
}

export interface DailyClosing {
    id: string;
    company_id: string;
    closing_date: string;
    closed_by: string | null;
    total_sales: number | string | null;
    total_credit: number | string | null;
    total_collected: number | string | null;
    summary_json: DailyClosingSummary | null;
    status: daily_closing_status | string;
    closed_at: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    companies?: { id: string; name?: string } | null;
    users?: { id: string; name?: string } | null;
}

export interface DailyClosingQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    company_id?: string;
    date_from?: string;
    date_to?: string;
}
