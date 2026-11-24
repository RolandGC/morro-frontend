import type { DailyClosingSummary } from "../types/dailyClosing.types";

export interface DailyClosingSummaryRow {
    label: string;
    count: number;
    total: number;
}

type SummaryBucket = {
    count?: number | string | null;
    total?: number | string | null;
};

const METHOD_LABELS: Record<string, string> = {
    cash: "Efectivo",
    yape: "Yape",
    plin: "Plin",
    card: "Tarjeta",
    credit_card: "Tarjeta de crédito",
    debit_card: "Tarjeta de débito",
    transfer: "Transferencia",
    bank: "Banco",
    unknown: "Sin especificar",
};

function toNumber(value: unknown): number {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function humanizeKey(key: string): string {
    const normalized = key.trim();
    const known = METHOD_LABELS[normalized.toLowerCase()];
    if (known) return known;

    if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            normalized
        )
    ) {
        return `Cuenta ${normalized.slice(0, 8)}`;
    }

    return normalized
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function rowsFromBucket(
    bucket: Record<string, SummaryBucket> | undefined
): DailyClosingSummaryRow[] {
    return Object.entries(bucket ?? {})
        .map(([key, value]) => ({
            label: humanizeKey(key),
            count: Math.trunc(toNumber(value?.count)),
            total: toNumber(value?.total),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Ventas agrupadas por método de pago del `summary_json` real del backend. */
export function getDailyClosingSalesByMethod(
    summary: DailyClosingSummary | null | undefined
): DailyClosingSummaryRow[] {
    if (!summary) return [];

    // El documento propone `payment_summary`; el backend original no lo
    // devuelve. Se conserva sólo como compatibilidad de presentación.
    if (summary.payment_summary?.length) {
        return summary.payment_summary
            .map((item) => ({
                label: item.payment_account_name,
                count: Math.trunc(toNumber(item.count)),
                total: toNumber(item.total),
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "es"));
    }

    return rowsFromBucket(summary.by_payment_method);
}

/** Cobranzas de crédito agrupadas por cuenta/método. */
export function getDailyClosingCollectionsByMethod(
    summary: DailyClosingSummary | null | undefined
): DailyClosingSummaryRow[] {
    return rowsFromBucket(summary?.collections_by_payment_method);
}

/** Ventas agrupadas por moneda. */
export function getDailyClosingCurrencies(
    summary: DailyClosingSummary | null | undefined
): DailyClosingSummaryRow[] {
    return rowsFromBucket(summary?.by_currency);
}
