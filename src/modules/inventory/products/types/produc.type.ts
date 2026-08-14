import { Category } from "@/modules/core/category/types/category.types";
import { Brand } from "../../brands/types/brand.types";
import { regime } from "@/types/types";

export interface Product {
    id: string;
    category_id: string;
    brand_id: string;
    name: string;
    model: string;
    unit_base: string;
    regime: regime;
    has_igv: boolean;
    track_stock: boolean;
    is_active: boolean;
    brands: Brand;
    categories: Category;
    created_at: string;
    product_units: ProductUnit[];
}

export interface ProductUnit {
    id: string;
    name: string,
    conversion_factor: number,
    barcode: string,
    is_default: boolean,
    created_at: string,
};

export interface ProductQueryParams {
    page?: number | undefined; // default: 1
    limit?: number | undefined; // default: 20
    name?: string | undefined;
    model?: string | undefined;
    brand_id?: string | undefined;
    category_id?: string | undefined;
    unit_base?: string | undefined;
    regime?: regime | undefined;
    has_igv?: boolean | undefined;
    track_stock?: boolean | undefined;
    is_active?: boolean | undefined;
    order?: "asc" | "desc";
}