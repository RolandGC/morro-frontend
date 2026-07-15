import { doc_type } from "@/types/types";
import { z } from "zod";

export const customerSchema = z.object({
  full_name: z
    .string()
    .min(3, "El nombre completo debe tener al menos 3 caracteres")
    .max(255, "El nombre completo no puede superar los 255 caracteres"),

  doc_type: z.nativeEnum(doc_type),

  doc_number: z
    .string()
    .min(8, "El número de documento es inválido")
    .max(20, "El número de documento no puede superar los 20 caracteres"),

  phone: z
    .string()
    .regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos")
    .optional()
    .or(z.literal("")),

  email: z
    .email("Ingrese un correo electrónico válido")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(255, "La dirección no puede superar los 255 caracteres")
    .optional(),

  credit_limit: z.coerce
    .number()
    .min(0, "El límite de crédito no puede ser negativo"),

  credit_balance: z.coerce
    .number()
    .min(0, "El saldo de crédito no puede ser negativo"),
});

export type CustomerForm = z.infer<typeof customerSchema>;