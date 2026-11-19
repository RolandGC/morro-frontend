import { z } from "zod";

const stockComparisonItemSchema = z.object({
    product_id: z.string().uuid("Debe seleccionar un producto válido"),

    product_unit_id: z
        .string()
        .uuid("Debe seleccionar una unidad válida"),

    counted_quantity: z
        .number({
            error: "La cantidad contada debe ser un número",
        })
        .min(0, "La cantidad contada no puede ser negativa")
        .finite("La cantidad contada debe ser un número válido"),
});

export const stockComparisonSchema = z
    .object({
        warehouse_id: z
            .string()
            .uuid("Debe seleccionar un almacén válido"),

        reason: z
            .string()
            .trim()
            .min(3, "Debe ingresar al menos 3 caracteres")
            .max(500, "El motivo no puede superar los 500 caracteres"),

        items: z
            .array(stockComparisonItemSchema)
            .min(1, "Debe agregar al menos un producto"),
    })
    .superRefine((values, ctx) => {
        const seen = new Set<string>();

        values.items.forEach((item, index) => {
            const key = `${item.product_id}:${item.product_unit_id}`;

            if (seen.has(key)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["items", index, "product_unit_id"],
                    message: "Este producto y unidad ya fueron agregados",
                });
                return;
            }

            seen.add(key);
        });
    });

export type StockComparisonForm = z.infer<typeof stockComparisonSchema>;
