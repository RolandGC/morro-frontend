export interface Category {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    is_active: boolean;
}

export interface CreateCategory {
     name: string;
     description: string;
     parent_id: string | null;
}