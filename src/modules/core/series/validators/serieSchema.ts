import { series_type } from '@/types/types';
import { z } from 'zod';

export const serieSchema = z.object({
    company_id: z.string().uuid().optional(),
    environment: z.enum(["beta", "produccion"]),
    create_in_other_environment: z.boolean(),
    user_id: z.string().uuid(),
    series: z
        .string()
        .trim()
        .min(1, 'La serie es requerida')
        .max(4, 'La serie debe tener 4 caracteres')
        .transform((value) => value.toUpperCase()),
    type: z.nativeEnum(series_type),
    next_number: z.number().int().min(1, 'El inicio debe ser mayor o igual a 1'),
}).superRefine((data, ctx) => {
    if (
        (data.type === series_type.boleta_general || data.type === series_type.boleta_zofra) &&
        !/^B[A-Z0-9]{3}$/.test(data.series)
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['series'],
            message: 'La boleta debe tener una serie de 4 caracteres que empiece con B (ej. B101)',
        });
    }

    if (
        (data.type === series_type.factura_general || data.type === series_type.factura_zofra) &&
        !/^F[A-Z0-9]{3}$/.test(data.series)
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['series'],
            message: 'La factura debe tener una serie de 4 caracteres que empiece con F (ej. F101)',
        });
    }

    if (data.type === series_type.order_note && !/^[A-Z0-9]{1,4}$/.test(data.series)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['series'],
            message: 'La nota de pedido debe tener hasta 4 caracteres alfanuméricos',
        });
    }
});

export type SerieForm = z.infer<typeof serieSchema>;