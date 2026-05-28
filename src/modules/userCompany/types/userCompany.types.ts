export interface UserCompany {
    id: string,
    name: string,
    trade_name: string,
    parent_company_id: string | null,
    ruc: string,
    address: string,
    phone: string,
    logo_url: string | null,
    settings_json: string | null,
    is_active: boolean,
    created_at: string | null,
    updated_at: string | null
}