import z from "zod";

export const brandSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
});

export type BrandFormData = z.infer<typeof brandSchema>;