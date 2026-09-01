import { Warehouse } from "../../warehouses/types/warehouse.types";

export interface Company {
    id: string;
    name: string;
    trade_name: string;
    parent_company_id: string | null;
    ruc: string;
    address: string | null;
    phone: string;
    logo_url: string | null;
    settings_json?: Record<string, unknown> | null;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
    warehouse: Warehouse;
}

export interface CompanyQueryParams {
    page?: number | undefined;
    limit?: number | undefined;
    id?: string | undefined;
    name?: string | undefined;
    trade_name?: string | undefined;
    ruc?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    parent_company_id?: string | undefined;
    logo_url?: string | undefined;
    settings_json?: Record<string, any> | undefined;
    is_active?: boolean | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
  }