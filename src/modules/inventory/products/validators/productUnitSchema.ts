import { z } from "zod";

export const productUnitSchema = z.object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede superar los 100 caracteres"),
  
    conversion_factor: z.coerce
      .number()
      .min(1, "El factor de conversión debe ser mayor o igual a 1"),
  
    barcode: z
      .string()
      .max(50, "El código de barras no puede superar los 50 caracteres")
      .optional()
      .or(z.literal("")),
  
    is_default: z.boolean(),
  });
  
  export type ProductUnitForm = z.infer<typeof productUnitSchema>;