export interface Role {
    id: string;
    name: string;
    display_name: string;
    description: string;
    is_system: boolean;
    created_at: string | null;
    updated_at: string | null;
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