import { payment_account_type } from "@/types/types";
import z from "zod";

export const accountSchema = z.object({
    company_id: z.uuid("Empresa inválida"),

    name: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede superar los 100 caracteres"),

    type: z.enum(payment_account_type, {
        message: "Tipo de cuenta inválido",
    }),

    account_number: z
        .string()
        .trim()
        .min(1, "El número de cuenta es obligatorio")
        .max(50, "El número de cuenta no puede superar los 50 caracteres"),

    bank_name: z
        .string()
        .trim()
        .max(100, "El nombre del banco no puede superar los 100 caracteres")
        .optional(),

    currency_id: z.uuid("Moneda inválida"),

    is_active: z.boolean().optional(),
});

export type AccountForm = z.infer<typeof accountSchema>;
