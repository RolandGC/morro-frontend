import { sale_status, sale_type } from "@/types/types";
import { Customer } from "../../customers/types/customer.type";
import { Company } from "@/modules/core/companies/types/company.type";
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { User } from "@/modules/core/user/types/user.types";
import { Currency } from "@/modules/finances/currency/types/currency.types";

export interface Sale {
  id: string;
  company_id: string;
  warehouse_id: string;
  user_id: string;
  customer_id: string;
  price_list_id: string | null;
  currency_id: string;
  exchange_rate: string;
  sale_type: sale_type;
  status: sale_status;
  subtotal_general: string;
  subtotal_zofra: string;
  igv: string;
  total: string;
  total_base: string;
  sale_date: string;
  created_at: string;
  updated_at: string;

  customers: Customer;
  companies: Company;
  warehouses: Warehouse;
  users: User;
  notaPedidoBase64: string;
}

export interface SaleItem {
  product_id: string;
  product_unit_id: string;
  quantity: number;
  unit_quantity: number;
  unit_price: number;
  igv_amount: number;
  subtotal: number;
  is_bonus: boolean;
}
export interface SaleQueryParams {
  page?: number;
  limit?: number;
  status?: sale_status;
  sale_type?: sale_type;
  customer_id?: string;
  company_id?: string;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface SaleDetail {
  id: string;
  company_id: string;
  warehouse_id: string;
  user_id: string;
  customer_id: string;
  price_list_id: string | null;
  currency_id: string;
  exchange_rate: string;
  sale_type: string;
  status: string;
  subtotal_general: string;
  subtotal_zofra: string;
  igv: string;
  total: string;
  total_base: string;
  sale_date: string;
  created_at: string;
  updated_at: string;
  observations: string | null;

  customers: Customer;
  companies: Company;
  warehouses: Warehouse;
  users: User;
  currencies: Currency;
  //price_lists: PriceList | null;

  sale_items: SaleItem[];
  /* sale_payments: SalePayment[];
  vouchers: Voucher[];
  receivables: Receivable[]; */
}