import { purchase_status } from "@/types/types";
import { Supplier } from "../../suppliers/types/suppliers.types";
import { Company } from "@/modules/core/companies/types/company.type";
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { User } from "@/modules/core/user/types/user.types";

export interface PurchaseItem {
    product_id: string;
    product_unit_id: string;
    quantity: number;
    unit_quantity: number;
    unit_cost: number;
    total_cost: number;
    lot_number?: string;
    expiry_date?: string;
  }
  
  export interface Purchase {
    id: string;
    company_id: string;
    warehouse_id: string;
    supplier_id: string;
    currency_id: string;
    exchange_rate: string;
    created_by: string;
    status: purchase_status;
    reference_doc: string;
    total: string;
    total_base: string;
    purchase_date: string;
    created_at: string;
    updated_at: string;
    suppliers: Supplier;
    companies:Company;
    warehouses:Warehouse;
    currencies: Currency;
    users: User;
  }

  export interface PurchaseQueryParams {
    page?: number;
    limit?: number;
    status?: purchase_status;
    supplier_id?: string;
    company_id?: string;
    warehouse_id?: string;
    date_from?: string;
    date_to?: string;  
  }