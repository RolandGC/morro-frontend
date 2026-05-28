import { UserCompany } from "@/modules/userCompany/types/userCompany.types";

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  is_superadmin: boolean;
  is_active: boolean;
  last_login_at: string; // ISO date
  created_at: string | null;
  users_companies: UserCompany[];
}

