import { z } from "zod";

const notesSchema = z
    .string()
    .max(500, "Las notas no pueden superar los 500 caracteres")
    .optional()
    .or(z.literal(""));

export const cashboxDetailSchema = z.object({
    payment_account_id: z
        .string()
        .uuid("Debe seleccionar una cuenta de pago"),

    opening_amount: z
        .number({ error: "Ingrese un monto válido" })
        .min(0, "El importe de apertura no puede ser negativo"),
});

export const cashboxSchema = z.object({
    warehouse_id: z
        .string()
        .uuid("Debe seleccionar un almacén"),

    company_id: z
        .string()
        .uuid("Debe seleccionar una empresa"),

    notes: notesSchema,

    details: z
        .array(cashboxDetailSchema)
        .min(1, "Debe registrar al menos una cuenta de pago"),
});

export const cashSessionCloseDetailSchema = z.object({
    payment_account_id: z
        .string()
        .uuid("Cuenta de pago inválida"),

    declared_amount: z
        .number({ error: "Ingrese un monto válido" })
        .min(0, "El importe contado no puede ser negativo"),
});

export const cashSessionCloseSchema = z.object({
    details: z
        .array(cashSessionCloseDetailSchema)
        .min(1, "Debe declarar al menos una cuenta de pago"),
    notes: notesSchema,
});

export type CashboxForm = z.infer<typeof cashboxSchema>;
export type CashboxDetailForm = z.infer<typeof cashboxDetailSchema>;
export type CashSessionCloseForm = z.infer<typeof cashSessionCloseSchema>;
export type CashSessionCloseDetailForm = z.infer<
    typeof cashSessionCloseDetailSchema
>;
