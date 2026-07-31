import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre del rol debe tener al menos 2 caracteres")
    .max(50, "El nombre del rol no puede superar los 50 caracteres")
    .regex(
      /^[a-z0-9_]+$/,
      "El nombre solo puede contener letras minúsculas, números y guiones bajos"
    ),

  display_name: z
    .string()
    .trim()
    .min(2, "El nombre visible debe tener al menos 2 caracteres")
    .max(100, "El nombre visible no puede superar los 100 caracteres"),

  description: z
    .string()
    .trim()
    .max(255, "La descripción no puede superar los 255 caracteres")
    .optional()
    .or(z.literal("")),
});

export const permissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export type RoleForm = z.infer<typeof roleSchema>;
export type RolePermissionsForm = z.infer<typeof permissionsSchema>;