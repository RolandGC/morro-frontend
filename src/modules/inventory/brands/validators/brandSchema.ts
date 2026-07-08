import z from "zod";

export const brandSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
});

export type BrandForm = z.infer<typeof brandSchema>;