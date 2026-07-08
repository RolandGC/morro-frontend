import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  parent_id: z
    .uuid("Debe seleccionar una categoría padre válida")
    .optional()
    .nullable(),

  description: z
    .string()
    .max(255, "La descripción no puede superar los 255 caracteres")
    .optional(),
});

export type CategoryForm = z.infer<typeof categorySchema>;