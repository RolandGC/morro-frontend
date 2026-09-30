import { Company } from "@/modules/core/companies/types/company.type";

export interface UserCompany {
    id: string,
    user_id: string;
    company_id: string;
    is_active: boolean;
    assigned_at: string;
    created_at: string;
    updated_at: string | null;
    companies: Company;
}