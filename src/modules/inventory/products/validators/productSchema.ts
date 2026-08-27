import { z } from "zod";
import { regime } from "@/types/types";

/* export const productSchema = z.object({
    name: z.string().min(2, "Debe ingresar al menos 2 caracteres"),
    model: z.string().min(3, "Debe ingresar al menos 2 caracteres"),
    unit_base: z.string().min(1, "El campo es requerido"),
    regime: z.nativeEnum(regime),
    has_igv: z.boolean(),
    track_stock: z.boolean(),
    category_id: z.string().min(1, "Debe seleccionar una categoría"),
    brand_id: z.string().min(1, "Debe seleccionar una marca"),
}); */

export const productSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Debe ingresar al menos 2 caracteres")
        .max(200, "El nombre no puede superar los 200 caracteres"),

    model: z
        .string()
        .trim()
        .min(2, "Debe ingresar al menos 2 caracteres")
        .max(100, "El modelo no puede superar los 100 caracteres")
        .optional()
        .or(z.literal("")),

    brand_id: z
        .uuid("Debe seleccionar una marca válida"),

    category_id: z
        .uuid("Debe seleccionar una categoría válida"),

    unit_base: z
        .string()
        .trim()
        .min(1, "La unidad base es obligatoria")
        .max(10, "La unidad base no puede superar los 10 caracteres")
        .optional(),
    regime: z.nativeEnum(regime),

    has_igv: z.boolean(),

    track_stock: z.boolean(),
});

export type ProductForm = z.infer<typeof productSchema>;