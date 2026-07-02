import z from "zod";

export const userFormSchema = z.object({
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

export type FormUserDto = z.infer<typeof userFormSchema>;