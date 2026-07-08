import { z } from "zod";

export const warehouseSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede superar los 255 caracteres"),

  company_id: z
    .uuid("Debe seleccionar una empresa válida"),

  type: z.enum(["warehouse", "store"], {
    error: "El tipo de almacén no es válido",
  }),

  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(255, "La dirección no puede superar los 255 caracteres"),
});

export type WarehouseForm = z.infer<typeof warehouseSchema>;