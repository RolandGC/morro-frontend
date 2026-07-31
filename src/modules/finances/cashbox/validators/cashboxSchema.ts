import { z } from "zod";

export const cashboxDetailSchema = z.object({
    payment_account_id: z
        .string()
        .uuid("Debe seleccionar una cuenta de pago"),

    expected_amount: z
        .number()
        .min(0, "El monto esperado no puede ser negativo"),
});

export const cashboxSchema = z.object({
    warehouse_id: z
        .string()
        .uuid("Debe seleccionar un almacén"),

    company_id: z
        .string()
        .uuid("Debe seleccionar una empresa"),

    notes: z
        .string()
        .max(500, "Las notas no pueden superar los 500 caracteres")
        .optional()
        .or(z.literal("")),

    details: z
        .array(cashboxDetailSchema)
        .min(1, "Debe agregar al menos una cuenta de pago"),
});

export type CashboxForm = z.infer<typeof cashboxSchema>;
export type CashboxDetailForm = z.infer<typeof cashboxDetailSchema>;