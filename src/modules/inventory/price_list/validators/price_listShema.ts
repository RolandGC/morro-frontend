import { z } from "zod";

export const priceListSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  description: z
    .string()
    .trim()
    .max(255, "La descripción no puede superar los 255 caracteres")
    .optional(),

  company_id: z
    .uuid("Debe seleccionar una empresa válida"),

  currency_id: z
    .uuid("Debe seleccionar una moneda válida"),

  is_default: z.boolean(),
});

export type PriceListForm = z.infer<typeof priceListSchema>;