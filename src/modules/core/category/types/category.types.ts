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

export interface CategoryQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    name?: string | undefined;
    parent_id?: string | undefined;
    is_active?: boolean | undefined;
}