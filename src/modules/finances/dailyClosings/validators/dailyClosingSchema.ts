import { z } from "zod";

export const dailyClosingSchema = z.object({
    company_id: z.uuid("Debe seleccionar una empresa"),
    closing_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Seleccione una fecha válida")
        .refine((value) => {
            const date = new Date(`${value}T00:00:00.000Z`);
            return (
                !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value
            );
        }, "Seleccione una fecha válida"),
});

export type DailyClosingForm = z.infer<typeof dailyClosingSchema>;
