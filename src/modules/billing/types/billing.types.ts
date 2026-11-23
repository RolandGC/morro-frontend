export type BillingEnvironment = "beta" | "produccion";
export type BillingPlan = "free" | "premium";
export type BillingSyncStatus = "pending" | "synced" | "error";

export interface CompanyBillingSettings {
  environment: BillingEnvironment | null;
  plan: BillingPlan | null;
  provider_company_id: string | null;
  legal_name: string | null;
  trade_name: string | null;
  fiscal_address: string | null;
  ubigeo: string | null;
  department: string | null;
  province: string | null;
  district: string | null;
  urbanization: string | null;
  cod_local: string | null;
  email: string | null;
  phone: string | null;
  sol_user: string | null;
  has_sol_pass: boolean;
  certificate_filename: string | null;
  certificate_expires_at: string | null;
  has_certificate: boolean;
  has_p12: boolean;
  has_logo: boolean;
  sync_status: BillingSyncStatus | null;
  sync_error: string | null;
  last_synced_at: string | null;
  is_enabled: boolean | null;
  updated_at: string | null;
}

export interface BillingSyncResult {
  success: boolean;
  providerCompanyId?: string | null;
  error?: string;
}

export interface CompanyBillingResponse {
  company: {
    id: string;
    name: string | null;
    ruc: string | null;
    logo_url: string | null;
  };
  billing: CompanyBillingSettings | null;
  sync?: BillingSyncResult;
}

export interface BillingAccountResponse {
  configured: boolean;
  provider?: string;
  scope?: string;
  username?: string;
  base_url?: string;
  is_active?: boolean;
  token_expires_at?: string | null;
  last_login_at?: string | null;
  last_error?: string | null;
}

export interface UpdateCompanyBillingPayload {
  legal_name?: string;
  trade_name?: string;
  fiscal_address?: string;
  ubigeo?: string;
  department?: string;
  province?: string;
  district?: string;
  urbanization?: string;
  cod_local?: string;
  email?: string;
  phone?: string;
  environment?: BillingEnvironment;
  plan?: BillingPlan;
  sol_user?: string;
  sol_pass?: string;
  is_enabled?: boolean;
}

export interface UploadCertificatePayload {
  certificate_base64: string;
  format: "p12" | "pfx" | "pem";
  password?: string;
  filename?: string;
}

export interface UpdateBillingAccountPayload {
  username: string;
  password: string;
  base_url?: string;
  is_active?: boolean;
}
