export interface Product {
    name: string;
    model: string;
    brand_id: string;      // UUID
    category_id: string;   // UUID
    unit_base: string;
    regime: string;
    has_igv: boolean;
    track_stock: boolean;
}