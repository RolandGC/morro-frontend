import { z } from "zod";

export const userCompanySchema = z.object({
    user_id: z
        .uuid("El usuario debe ser uno válido"),

    company_id: z
        .uuid("La empresa debe ser uno válido"),

    is_active: z
        .boolean(),

    assigned_at: z
        .string()
        .optional()
});

export type UserCompanyForm = z.infer<typeof userCompanySchema>;