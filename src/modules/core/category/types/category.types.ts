export interface Category {
    id: string;
    name: string;
    parent_id: string | null;
    description: string;
    is_active: boolean;
}

export interface CreateCategory {
     name: string;
     description: string;
     parent_id: string | null;
}