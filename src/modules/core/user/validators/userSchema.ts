import z from "zod";

/* export const userFormSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    last_name: z.string().optional(),
    email: z.string().email("El email no es válido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .optional()
        .or(z.literal("")),
    doc_number: z.string().optional(),
    company_ids: z.array(z.string()).min(1, "Debe seleccionar al menos una empresa"),
    is_superadmin: z.boolean(),
    is_active: z.boolean().optional(),
});

 */

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  last_name: z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido no puede superar los 100 caracteres"),

  doc_number: z
    .string()
    .trim()
    .regex(/^\d{8,20}$/, "El documento debe tener entre 8 y 20 dígitos"),

  email: z
    .string()
    .email("Ingrese un correo electrónico válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña no puede superar los 100 caracteres"),

  company_ids: z
    .array(z.uuid("Empresa inválida"))
    .min(1, "Debe seleccionar al menos una empresa"),

  role_ids: z
    .array(z.uuid("Rol inválido"))
    .min(1, "Debe seleccionar un rol"),

  is_superadmin: z.boolean(),

  is_active: z.boolean(),
});

export type UserForm = z.infer<typeof userSchema>;