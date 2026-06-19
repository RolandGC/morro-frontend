import { Category } from "@/modules/core/category/types/category.types";
import { Brand } from "../../brands/types/brand.types";

export interface ProductSend {
    id?: string;
    name: string;
    model: string;
    brand_id: string;   
    category_id: string;
    unit_base: string;
    regime: string;
    has_igv: boolean;
    track_stock: boolean;
}

export interface Product {
    id: string;
    category_id: string;
    brand_id: string;
    name: string;
    model: string;
    unit_base: string;
    regime: string;
    has_igv: boolean;
    track_stock: boolean;
    is_active: boolean;
    brands: Brand;
    categories: Category;
    created_at: string;
}