import { UserCompany } from "@/modules/auth/userCompany/types/userCompany.types";

export interface User {
    id: string;
    name: string;
    last_name: string | null;
    email: string;
    password_hash: string;
    doc_number: string | null;
    is_superadmin: boolean;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    users_companies: UserCompany[];
}

export interface UserQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    company_id?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    is_active?: boolean | undefined;
}