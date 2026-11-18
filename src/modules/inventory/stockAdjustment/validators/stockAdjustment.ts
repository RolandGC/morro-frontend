
import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
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

                quantity: z
                    .number({
                        error: "La cantidad debe ser un número",
                    })
                    .positive("La cantidad debe ser mayor a cero"),

                unit_cost: z
                    .number({
                        error: "El costo unitario debe ser un número",
                    })
                    .min(0, "El costo unitario no puede ser negativo"),
            })
        )
        .min(1, "Debe agregar al menos un producto"),
});

export type InventoryAdjustmentForm = z.infer<
    typeof inventoryAdjustmentSchema
>;
