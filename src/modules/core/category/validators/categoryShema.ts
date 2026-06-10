import {z} from "zod";

export const categorySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
    parent_id: z.string().uuid().nullable().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;