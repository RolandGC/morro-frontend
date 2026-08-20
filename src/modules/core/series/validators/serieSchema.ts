import { series_type } from '@/types/types';
import { z } from 'zod';

export const serieSchema = z.object({
    user_id: z.string().uuid(),
    series: z.string().min(1, 'La serie es requerida'),
    type: z.enum(series_type),
    next_number: z.number(),
});

export type SerieForm = z.infer<typeof serieSchema>;