import z from "zod";

export const productSchema = z.object({
    name: z.string().min(3, "El nombre del producto es requerido"),
    model: z.string().min(2, "El modelo del producto es requerido"),
    description: z.string().max(200, "La descripción no puede exceder los 200 caracteres"),
    price: z.number().positive("El precio debe ser un número positivo"),
    stock: z.number().int().nonnegative("El stock debe ser un número entero no negativo")
});

export type ProductFormData = z.infer<typeof productSchema>;