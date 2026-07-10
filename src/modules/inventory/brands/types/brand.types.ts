export interface Brand {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
}

export interface CreateBrand {
    name: string;
}

export interface BrandQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    name?: string | undefined;
    is_active?: boolean | undefined;
}