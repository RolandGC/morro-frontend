import { z } from "zod";

export const productUnitSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  conversion_factor: z
    .number({
      error: "El factor de conversión es obligatorio",
    })
    .positive("El factor de conversión debe ser mayor que 0"),

  barcode: z
    .string()
    .max(50, "El código de barras no puede superar los 50 caracteres")
    .optional(),

  is_default: z.boolean(),
});

export type ProductUnitForm = z.infer<typeof productUnitSchema>;