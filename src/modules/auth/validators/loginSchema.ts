import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .min(1, "El email es requerido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .min(1, "La contraseña es requerida"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
