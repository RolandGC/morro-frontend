

import { z } from "zod";

export const stockComparisonSchema = z.object({
    warehouse_id: z
        .uuid("Debe seleccionar un almacén válido"),

    reason: z
        .string()
        .trim()
        .min(3, "Debe ingresar al menos 3 caracteres")
        .max(500, "El motivo no puede superar los 500 caracteres"),

    items: z
        .array(
            z.object({
                product_id: z
                    .uuid("Debe seleccionar un producto válido"),

                product_unit_id: z
                    .uuid("Debe seleccionar una unidad válida"),

                counted_quantity: z
                    .number({
                        error: "La cantidad contada debe ser un número",
                    })
                    .min(0, "La cantidad contada no puede ser negativa"),
            })
        )
        .min(1, "Debe agregar al menos un producto"),
});

export type StockComparisonForm = z.infer<
    typeof stockComparisonSchema
>;
