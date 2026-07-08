import { z } from "zod";

export const currencySchema = z.object({
  code: z
    .string()
    .length(3, "El código debe tener exactamente 3 caracteres")
    .transform((value) => value.toUpperCase()),

  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  symbol: z
    .string()
    .min(1, "El símbolo es obligatorio")
    .max(10, "El símbolo no puede superar los 10 caracteres"),

  is_base: z.boolean(),
});

export type CurrencyForm = z.infer<typeof currencySchema>;