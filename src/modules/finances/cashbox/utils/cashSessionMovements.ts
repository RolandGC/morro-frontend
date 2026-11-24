import type { Account } from "@/modules/finances/Account/types/account.types";

import type {
    CashSessionAccountSummary,
    CashSessionMovement,
    Cashbox,
} from "../types/cashbox.types";

export function formatCashSessionDateTime(
    value: string | null | undefined
): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

function toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function isWithinSession(
    paymentDate: string | null | undefined,
    session: Cashbox,
): boolean {
    if (!paymentDate) return false;

    const date = new Date(paymentDate);
    if (Number.isNaN(date.getTime())) return false;
    if (session.opened_at && date < new Date(session.opened_at)) return false;
    if (date > new Date()) return false;

    return true;
}

/**
 * Devuelve los movimientos tal como los contabiliza el backend original al
 * cerrar: usa `amount_base`, excluye pagos de ventas de crédito, cobros
 * reversados y todo lo que esté fuera de la ventana apertura..ahora.
 *
 * Limitación del backend: los pagos de ventas canceladas sí se cuentan. La UI
 * los muestra con una etiqueta explícita en lugar de descartarlos y generar un
 * saldo esperado distinto al que guarda el servidor.
 */
export function getCashSessionMovements(
    session: Cashbox | null | undefined,
): CashSessionMovement[] {
    if (!session) return [];

    const movements: CashSessionMovement[] = [];

    for (const payment of session.sale_payments ?? []) {
        if (payment.sales?.sale_type === "credit") continue;
        if (!isWithinSession(payment.payment_date, session)) continue;

        const amount = toNumber(payment.amount_base);
        if (amount === 0 || !payment.payment_account_id) continue;

        movements.push({
            id: payment.id,
            type: "sale_payment",
            payment_account_id: payment.payment_account_id,
            payment_account_name:
                payment.payment_accounts?.name ?? "Cuenta de pago",
            payment_date: payment.payment_date ?? null,
            amount,
            description:
                payment.sales?.status === "cancelled"
                    ? "Pago de venta anulada"
                    : "Pago de venta",
        });
    }

    for (const payment of session.receivable_payments ?? []) {
        if (payment.reversed_at) continue;
        if (payment.cash_session_id !== session.id) continue;
        if (!isWithinSession(payment.payment_date, session)) continue;

        const amount = toNumber(payment.amount_base);
        if (amount === 0 || !payment.payment_account_id) continue;

        movements.push({
            id: payment.id,
            type: "receivable_payment",
            payment_account_id: payment.payment_account_id,
            payment_account_name:
                payment.payment_accounts?.name ?? "Cuenta de pago",
            payment_date: payment.payment_date ?? null,
            amount,
            description: "Cobro de crédito",
        });
    }

    return movements.sort((a, b) => {
        const first = a.payment_date ?? "";
        const second = b.payment_date ?? "";
        return second.localeCompare(first);
    });
}

/**
 * Construye las filas de conciliación. Las cuentas sin movimiento pero con
 * apertura siempre aparecen; las cuentas con movimiento se agregan aunque la
 * sesión antigua no tenga `cash_session_details`.
 */
export function getCashSessionAccountSummary(
    session: Cashbox | null | undefined,
    activeAccounts: Account[] = [],
): CashSessionAccountSummary[] {
    if (!session) return [];

    const summaries = new Map<string, CashSessionAccountSummary>();

    const ensureAccount = (accountId: string, name: string) => {
        const existing = summaries.get(accountId);
        if (existing) return existing;

        const created: CashSessionAccountSummary = {
            payment_account_id: accountId,
            payment_account_name: name,
            opening_amount: 0,
            collected_amount: 0,
            expected_amount: 0,
            declared_amount: null,
            difference: null,
        };
        summaries.set(accountId, created);
        return created;
    };

    for (const detail of session.cash_session_details ?? []) {
        if (!detail.payment_account_id) continue;
        const row = ensureAccount(
            detail.payment_account_id,
            detail.payment_accounts?.name ?? "Cuenta de pago",
        );
        row.opening_amount = toNumber(detail.opening_amount);
        row.declared_amount =
            detail.declared_amount === null || detail.declared_amount === undefined
                ? null
                : toNumber(detail.declared_amount);
    }

    for (const movement of getCashSessionMovements(session)) {
        const row = ensureAccount(
            movement.payment_account_id,
            movement.payment_account_name,
        );
        row.collected_amount += movement.amount;
    }

    if (summaries.size === 0) {
        for (const account of activeAccounts) {
            ensureAccount(account.id, account.name);
        }
    }

    return [...summaries.values()].map((row) => ({
        ...row,
        expected_amount: row.opening_amount + row.collected_amount,
        difference:
            row.declared_amount === null
                ? null
                : row.declared_amount - (row.opening_amount + row.collected_amount),
    }));
}
