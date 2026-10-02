import { payment_account_type } from "@/types/types";

export interface ReportQueryParams {
  company_id: string;
  date_from?: string;
  date_to?: string;
  warehouse_id?: string;
}

export interface TopProductsQueryParams extends ReportQueryParams {
  limit?: number;
  sort_by?: "amount" | "quantity";
}

export interface PaymentsReportQueryParams {
  company_id: string;
  date_from?: string;
  date_to?: string;
  customer_id?: string;
  warehouse_id?: string;
  currency_id?: string;
  payment_account_id?: string;
  user_id?: string;
  payment_method?: payment_account_type;
  format?: "pdf" | "xlsx";
}

export interface ReportSummary {
  date_from: string;
  date_to: string;
  sales: {
    count: number;
    total: number;
    cash: number;
    credit: number;
    igv: number;
    ticket_average: number;
    cancelled_count: number;
  };
  purchases: {
    count: number;
    total: number;
  };
  receivables_pending: number;
}

export interface SalesByDayItem {
  date: string;
  count: number;
  total: number;
  cash: number;
  credit: number;
}

export interface SalesByDayReport {
  date_from: string;
  date_to: string;
  data: SalesByDayItem[];
}

export interface SalesByPaymentMethodItem {
  method: string;
  label: string;
  count: number;
  total: number;
}

export interface SalesByPaymentMethodReport {
  date_from: string;
  date_to: string;
  data: SalesByPaymentMethodItem[];
}

export interface TopProductItem {
  product_id: string | null;
  name: string | null;
  model: string | null;
  quantity: number;
  amount: number;
}

export interface TopProductsReport {
  date_from: string;
  date_to: string;
  data: TopProductItem[];
}

export interface LowStockItem {
  product_id: string | null;
  product_name: string | null;
  model: string | null;
  warehouse_id: string | null;
  warehouse_name: string | null;
  quantity: number;
  min_stock: number | null;
  reorder_point: number | null;
}

export interface LowStockReport {
  count: number;
  items: LowStockItem[];
}

export interface ReceivablesAgingBuckets {
  current: number;
  d1_30: number;
  d31_60: number;
  d61_90: number;
  d90_plus: number;
}

export interface ReceivablesAgingCustomer {
  customer_id: string | null;
  customer_name: string | null;
  pending: number;
}

export interface ReceivablesAgingReport {
  total_pending: number;
  overdue: number;
  buckets: ReceivablesAgingBuckets;
  by_customer: ReceivablesAgingCustomer[];
}

export interface PaymentsReportFile {
  filename: string;
  mime_type: string;
  base64: string;
}
