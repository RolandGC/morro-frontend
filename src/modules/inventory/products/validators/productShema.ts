import z from "zod";
import { regime } from "@/types/types";

export const productSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    model: z.string().optional(),
    unit: z.string().min(1, "Unidad requerida"),
    regime: z.nativeEnum(regime),
    has_igv: z.boolean(),
    track_stock: z.boolean(),
    category_id: z.string(),
    brand_id: z.string(),
});

export type CreateProductDto = z.infer<typeof productSchema>;