export interface Role {
    id: string;
    name: string;
    display_name: string;
    description: string;
    is_system: boolean;
    created_at: string | null;
    updated_at: string | null;
    role_permissions?: Array<{
      permission_id: string;
      [key: string]: unknown;
    }>;
  }
  
  export interface UserRole {
    id: string;
    user_id: string;
    role_id: string;
    assigned_by: string | null;
    assigned_at: string | null;
    created_at: string;
    updated_at: string | null;
    roles: Role;
  }

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  display_name: string;
}