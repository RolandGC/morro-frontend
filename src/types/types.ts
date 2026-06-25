export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginationResponse<T> {
    data: T[];
    meta: PaginationMeta;
}



export enum cash_session_status {
    open = "open",
    closed = "closed",
}

export enum credit_note_status {
    pending = "pending",
    accepted = "accepted",
    rejected = "rejected",
}

export enum daily_closing_status {
    open = "open",
    closed = "closed",
}

export enum doc_type {
    dni = "dni",
    ruc = "ruc",
    ce = "ce",
}

export enum movement_type {
    purchase = "purchase",
    sale = "sale",
    transfer = "transfer",
    adjustment = "adjustment",
}

export enum payment_account_type {
    cash = "cash",
    yape = "yape",
    plin = "plin",
    debit_card = "debit_card",
    credit_card = "credit_card",
    transfer = "transfer",
}

export enum purchase_status {
    pending = "pending",
    confirmed = "confirmed",
    cancelled = "cancelled",
}

export enum receivable_status {
    pending = "pending",
    partial = "partial",
    paid = "paid",
    overdue = "overdue",
}

export enum reference_type {
    purchase = "purchase",
    sale = "sale",
    stock_movement = "stock_movement",
}

export enum regime {
    general = "general",
    zofra = "zofra",
    mixed = "mixed",
}

export enum sale_status {
    pending = "pending",
    paid = "paid",
    delivered = "delivered",
    cancelled = "cancelled",
}

export enum sale_type {
    cash = "cash",
    credit = "credit",
}

export enum stock_movement_status {
    pending = "pending",
    confirmed = "confirmed",
    cancelled = "cancelled",
}

export enum sunat_status {
    pending = "pending",
    accepted = "accepted",
    rejected = "rejected",
    contingency = "contingency",
}

export enum transfer_type {
    internal = "internal",
    intercompany = "intercompany",
}

export enum voucher_type {
    receipt = "receipt",
    invoice = "invoice",
}

export enum warehouse_type {
    warehouse = "warehouse",
    store = "store",
}