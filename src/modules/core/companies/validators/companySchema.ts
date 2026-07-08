import { z } from "zod";

export const companySchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"),

  trade_name: z
    .string()
    .min(2, "El nombre comercial debe tener al menos 2 caracteres")
    .max(255)
    .optional(),

  parent_company_id: z
    .uuid("Debe ser un UUID válido")
    .optional()
    .nullable(),

  ruc: z
    .string()
    .regex(/^\d{11}$/, "El RUC debe contener exactamente 11 dígitos"),

  address: z
    .string()
    .min(5, "La dirección es obligatoria")
    .max(255),

  phone: z
    .string()
    .regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos"),

  logo_url: z
    .url("Debe ser una URL válida")
    .optional()
    .nullable(),

  settings_json: z
    .record(z.string(), z.unknown())
    .optional()
    .default({}),
});

export type CompanyForm = z.infer<typeof companySchema>;