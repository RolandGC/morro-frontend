/** Tipos derivados exclusivamente de los contratos reales de /electronic-invoicing. */

export type ElectronicDocumentStatus =
  | "not_sent"
  | "pending"
  | "accepted"
  | "rejected"
  | "contingency";

export type ElectronicDocumentKind = "boleta" | "factura";
export type ElectronicDocumentKindFilter = ElectronicDocumentKind | "all";

export interface ElectronicCustomer {
  id: string;
  name: string | null;
  doc_type: string | null;
  doc_number: string | null;
}

export interface ElectronicSale {
  id: string;
  sale_date: string;
  sale_type: string | null;
  status: string | null;
  total: number;
  total_base: number;
  warehouse: { id: string; name: string } | null;
  seller: { id: string; name: string } | null;
  currency: { id: string; code: string; symbol: string | null } | null;
}

export interface ElectronicVoucher {
  id: string;
  series: string | null;
  number: number | null;
  status: string | null;
  code: string | null;
  message: string | null;
  hash: string | null;
  external_id: string | null;
  sent_at: string | null;
  retry_count: number;
  next_retry_at: string | null;
  environment: string | null;
  provider_company_id: string | null;
}

export interface ElectronicDocumentTotals {
  subtotal: number;
  igv: number;
  total: number;
}

export interface ElectronicDocumentItem {
  sale_item_id: string;
  product_id: string | null;
  product_name: string | null;
  model: string | null;
  unit: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  igv_amount: number;
  is_bonus: boolean;
}

export interface ElectronicDocument {
  id: string;
  document_type: string;
  kind: ElectronicDocumentKind;
  regime: "general" | "zofra";
  series: string;
  number: number;
  created_at: string;
  company_id: string;
  customer_id: string | null;
  status: ElectronicDocumentStatus;
  sendable: boolean;
  totals: ElectronicDocumentTotals;
  customer: ElectronicCustomer | null;
  sale: ElectronicSale;
  voucher: ElectronicVoucher | null;
}

export interface ElectronicDocumentDetail extends ElectronicDocument {
  items: ElectronicDocumentItem[];
}

export interface ElectronicDocumentQueryParams {
  page: number;
  limit: number;
  company_id?: string;
  warehouse_id?: string;
  customer_id?: string;
  kind?: ElectronicDocumentKindFilter;
  status?: ElectronicDocumentStatus | "all";
  date_from?: string;
  date_to?: string;
}

export interface ElectronicInvoicingSummary {
  total: number;
  not_sent: number;
  pending: number;
  accepted: number;
  rejected: number;
  contingency: number;
}

export interface SendDocumentResponse {
  issuedDocumentId: string;
  series: string;
  number: number;
  status: "accepted" | "rejected" | "contingency" | "pending";
  message?: string | null;
  code?: string | null;
  hash?: string | null;
}

export interface SendBatchResult {
  document_id: string;
  status: string;
  series?: string;
  number?: number;
  message?: string | null;
  code?: string | null;
  hash?: string | null;
}

export interface SendBatchResponse {
  total: number;
  summary: {
    accepted: number;
    rejected: number;
    contingency: number;
    error: number;
  };
  results: SendBatchResult[];
}
