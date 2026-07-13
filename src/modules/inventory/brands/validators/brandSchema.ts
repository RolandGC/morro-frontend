import z from "zod";

export const brandSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    is_active: z.boolean(),
});

export type BrandForm = z.infer<typeof brandSchema>;