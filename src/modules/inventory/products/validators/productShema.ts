import z from "zod";
import { regime } from "@/types/types";

export const productSchema = z.object({
    name: z.string().min(2, "Debe ingresar al menos 2 caracteres"),
    model: z.string().min(3, "Debe ingresar al menos 2 caracteres"),
    unit_base: z.string().min(1, "El campo es requerido"),
    regime: z.nativeEnum(regime),
    has_igv: z.boolean(),
    track_stock: z.boolean(),
    category_id: z.string().min(1, "Debe seleccionar una categoría"),
    brand_id: z.string().min(1, "Debe seleccionar una marca"),
});

export type FormProductDto = z.infer<typeof productSchema>;