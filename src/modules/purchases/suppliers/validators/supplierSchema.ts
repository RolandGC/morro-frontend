import { z } from "zod";

export const supplierSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"),

  company_id: z
    .uuid("Debe seleccionar una empresa válida"),

  ruc: z
    .string()
    .regex(/^\d{11}$/, "El RUC debe contener exactamente 11 dígitos"),

  phone: z
    .string()
    .regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos")
    .optional()
    .or(z.literal("")),

  email: z
    .email("Ingrese un correo electrónico válido")
    .optional()
    .or(z.literal("")),
});

export type SupplierForm = z.infer<typeof supplierSchema>;