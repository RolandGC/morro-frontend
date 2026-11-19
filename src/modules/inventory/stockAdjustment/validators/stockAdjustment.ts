import { z } from "zod";

/**
 * Espejo de CreateStockAdjustmentDto / CreateStockAdjustmentItemDto.
 * `quantity` admite signo porque el backend lo interpreta como:
 *   > 0 -> entrada, < 0 -> salida, 0 -> ítem sin movimiento.
 * `unit_cost` es opcional (mínimo 0.01) y el backend solo lo exige
 * cuando una entrada no encuentra stock previo.
 */
const stockAdjustmentItemSchema = z.object({
    product_id: z.string().uuid("Debe seleccionar un producto válido"),

    product_unit_id: z
        .string()
        .uuid("Debe seleccionar una unidad válida"),

    quantity: z
        .number({
            error: "La cantidad debe ser un número",
        })
        .finite("La cantidad debe ser un número válido"),

    unit_cost: z
        .number({
            error: "El costo unitario debe ser un número",
        })
        .min(0.01, "El costo unitario debe ser mayor o igual a 0.01")
        .finite("El costo unitario debe ser un número válido")
        .optional(),
});

export const stockAdjustmentSchema = z.object({
    warehouse_id: z
        .string()
        .uuid("Debe seleccionar un almacén válido"),

    reason: z
        .string()
        .trim()
        .min(3, "Debe ingresar al menos 3 caracteres")
        .max(500, "El motivo no puede superar los 500 caracteres"),

    items: z
        .array(stockAdjustmentItemSchema)
        .min(1, "Debe agregar al menos un producto"),
});

export type StockAdjustmentForm = z.infer<typeof stockAdjustmentSchema>;
